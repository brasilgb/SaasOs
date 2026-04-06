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
            'receivingequipment' => 'Recebi o equipamento descrito para diagnostico e manutencao.',
            'equipmentdelivery' => 'Entreguei o equipamento em perfeitas condicoes de funcionamento.',
            'budgetissuance' => 'Orcamento emitido e validado com o cliente.',
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(fn () => ['tenant_id' => $tenantId]);
    }
}
