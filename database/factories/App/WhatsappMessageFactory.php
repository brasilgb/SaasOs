<?php

namespace Database\Factories\App;

use App\Models\App\WhatsappMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WhatsappMessage>
 */
class WhatsappMessageFactory extends Factory
{
    protected $model = WhatsappMessage::class;

    public function definition(): array
    {
        return [
            'generatedbudget' => 'Seu orcamento foi gerado e esta disponivel para aprovacao.',
            'servicecompleted' => 'Seu equipamento esta pronto para retirada.',
            'feedback' => 'Como foi sua experiencia com nosso atendimento?',
            'defaultmessage' => 'Atualizacao da sua ordem de servico.',
            'budgetfollowup' => 'Seu orcamento continua aguardando retorno.',
            'pendingpayment' => 'Sua ordem segue com saldo pendente.',
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(fn () => ['tenant_id' => $tenantId]);
    }
}
