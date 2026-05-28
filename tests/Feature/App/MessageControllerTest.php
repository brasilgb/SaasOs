<?php

namespace Tests\Feature\App;

use App\Models\App\Message;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageControllerTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $sender;

    private User $recipient;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->sender = User::factory()->forTenant($this->tenant->id)->create();
        $this->recipient = User::factory()->forTenant($this->tenant->id)->create();

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->sender);
    }

    public function test_it_records_operational_audit_for_message_lifecycle(): void
    {
        $createResponse = $this->post(route('app.messages.store'), [
            'recipient_id' => $this->recipient->id,
            'title' => 'Retorno técnico',
            'message' => 'Equipamento pronto para análise.',
            'status' => 0,
        ]);

        $createResponse->assertSessionHas('success', 'Mensagem cadastrada com sucesso');

        $message = Message::query()->firstOrFail();

        $this->assertDatabaseHas('operational_audits', [
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->sender->id,
            'entity_type' => 'message',
            'entity_id' => $message->id,
            'action' => 'message_created',
        ]);

        $updateResponse = $this->put(route('app.messages.update', $message), [
            'recipient_id' => $this->recipient->id,
            'title' => 'Retorno técnico ajustado',
            'message' => 'Equipamento pronto e aguardando sua confirmação.',
            'status' => 0,
        ]);

        $updateResponse->assertSessionHas('success', 'Mensagem editada com sucesso');

        $this->assertDatabaseHas('operational_audits', [
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->sender->id,
            'entity_type' => 'message',
            'entity_id' => $message->id,
            'action' => 'message_updated',
        ]);

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->recipient);

        $readResponse = $this->patch(route('app.messages.read', $message), [
            'status' => 1,
        ]);

        $readResponse->assertSessionHas('success', 'Mensagem marcada como lida');

        $this->assertDatabaseHas('operational_audits', [
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->recipient->id,
            'entity_type' => 'message',
            'entity_id' => $message->id,
            'action' => 'message_read_status_updated',
        ]);

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->sender);

        $deleteResponse = $this->delete(route('app.messages.destroy', $message));

        $deleteResponse->assertSessionHas('success', 'Mensagem excluída com sucesso!');

        $this->assertDatabaseMissing('messages', [
            'id' => $message->id,
        ]);

        $this->assertDatabaseHas('operational_audits', [
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->sender->id,
            'entity_type' => 'message',
            'entity_id' => $message->id,
            'action' => 'message_deleted',
        ]);
    }

    public function test_administrator_can_view_all_messages_and_filter_only_their_messages(): void
    {
        Message::query()->create([
            'tenant_id' => $this->tenant->id,
            'message_number' => 999,
            'sender_id' => $this->sender->id,
            'recipient_id' => $this->recipient->id,
            'title' => 'Mensagem para operador',
            'message' => 'Conteudo da mensagem.',
            'status' => 0,
        ]);

        $admin = User::factory()->forTenant($this->tenant->id)->create([
            'roles' => User::ROLE_ADMIN,
        ]);

        Message::query()->create([
            'tenant_id' => $this->tenant->id,
            'message_number' => 1000,
            'sender_id' => $admin->id,
            'recipient_id' => $this->recipient->id,
            'title' => 'Mensagem do administrador',
            'message' => 'Conteudo da mensagem do administrador.',
            'status' => 0,
        ]);

        $response = $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($admin)
            ->get(route('app.messages.index'));

        $response->assertOk()
            ->assertViewHas('page.props.messages.data', fn ($messages) => count($messages) === 2);

        $response = $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($admin)
            ->get(route('app.messages.index', ['filter' => 'mine']));

        $response->assertOk()
            ->assertViewHas(
                'page.props.messages.data',
                fn ($messages) => count($messages) === 1 && collect($messages)->pluck('message_number')->contains(1000)
            );
    }

    public function test_root_app_cannot_mark_message_as_read_when_not_recipient(): void
    {
        $message = Message::query()->create([
            'tenant_id' => $this->tenant->id,
            'message_number' => 1001,
            'sender_id' => $this->sender->id,
            'recipient_id' => $this->recipient->id,
            'title' => 'Mensagem para operador',
            'message' => 'Conteudo da mensagem.',
            'status' => 0,
        ]);

        $rootApp = User::factory()->forTenant($this->tenant->id)->create([
            'roles' => User::ROLE_ROOT_APP,
        ]);

        $response = $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($rootApp)
            ->patch(route('app.messages.read', $message), [
                'status' => 1,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'status' => 0,
        ]);
    }

    public function test_marking_message_as_read_preserves_current_message_filters(): void
    {
        $message = Message::query()->create([
            'tenant_id' => $this->tenant->id,
            'message_number' => 1002,
            'sender_id' => $this->sender->id,
            'recipient_id' => $this->recipient->id,
            'title' => 'Mensagem recebida',
            'message' => 'Conteudo da mensagem recebida.',
            'status' => 0,
        ]);

        $filteredUrl = route('app.messages.index', [
            'filter' => 'received',
            'status' => '0',
        ]);

        $response = $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->recipient)
            ->from($filteredUrl)
            ->patch(route('app.messages.read', $message), [
                'status' => 1,
            ]);

        $response->assertRedirect($filteredUrl);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'status' => 1,
        ]);
    }
}
