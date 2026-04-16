<?php

namespace Tests\Feature\App;

use App\Models\App\WhatsappMessage;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WhatsappMessageControllerTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->forTenant($this->tenant->id)->create();

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->user);
    }

    public function test_it_records_operational_audit_when_whatsapp_templates_are_updated(): void
    {
        $settings = WhatsappMessage::create([
            'generatedbudget' => 'modelo 1',
            'servicecompleted' => 'modelo 2',
            'feedback' => 'modelo 3',
            'defaultmessage' => 'modelo 4',
            'budgetfollowup' => 'modelo 5',
            'pendingpayment' => 'modelo 6',
        ]);

        $response = $this->patch(route('app.whatsapp-message.update', $settings), [
            'generatedbudget' => 'novo orçamento',
            'servicecompleted' => 'novo serviço concluído',
            'feedback' => 'novo feedback',
            'defaultmessage' => 'nova padrão',
            'budgetfollowup' => 'novo follow-up',
            'pendingpayment' => 'nova cobrança',
        ]);

        $response->assertSessionHas('success', 'Mensagens do WhatsApp editadas com sucesso');

        $this->assertDatabaseHas('operational_audits', [
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'entity_type' => 'whatsapp_message_settings',
            'entity_id' => $settings->id,
            'action' => 'whatsapp_message_settings_updated',
        ]);
    }
}
