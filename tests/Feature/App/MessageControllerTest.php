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
}
