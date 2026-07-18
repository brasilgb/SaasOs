<?php

namespace Database\Factories\App;

use App\Models\App\Receipt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Receipt>
 */
class ReceiptFactory extends Factory
{
    protected $model = Receipt::class;

    public function definition(): array
    {
        return [
            'receivingequipment' => 'Eu {{ cliente }}, inscrito(a) sob CPF/CNPJ numero {{ cpf_cnpj }}, me responsabilizo por eventuais perdas e/ou danos de arquivos, fotos, agenda, ou quaisquer outros dados armazenados no HD, SSD, cartao de memoria ou memoria interna do meu equipamento.',
            'equipmentdelivery' => 'Eu {{ cliente }}, inscrito(a) sob CPF/CNPJ numero {{ cpf_cnpj }}, declaro estar ciente dos prazos de garantia conforme o Codigo de Defesa do Consumidor.',
            'budgetissuance' => 'Equipamento analisado preliminarmente. Segue orcamento inicial para reparo conforme diagnostico tecnico apresentado nesta O.S.',
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(fn () => ['tenant_id' => $tenantId]);
    }
}
