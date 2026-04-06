<?php

namespace Database\Factories\Admin;

use App\Models\Admin\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Branch>
 */
class BranchFactory extends Factory
{
    protected $model = Branch::class;

    public function definition(): array
    {
        return [
            'branch_cnpj' => $this->faker->unique()->numerify('##############'),
            'branch_name' => 'Filial '.$this->faker->company(),
            'branch_number' => (string) $this->faker->numberBetween(1, 999),
            'contact_name' => $this->faker->name(),
            'contact_email' => $this->faker->safeEmail(),
            'contact_phone' => $this->faker->phoneNumber(),
            'contact_whatsapp' => $this->faker->phoneNumber(),
            'logo' => null,
            'cep' => $this->faker->postcode(),
            'state' => $this->faker->stateAbbr(),
            'city' => $this->faker->city(),
            'district' => 'Centro',
            'street' => $this->faker->streetName(),
            'number' => (string) $this->faker->numberBetween(1, 9999),
            'complement' => $this->faker->optional()->secondaryAddress(),
            'status' => $this->faker->boolean(80),
            'observations' => $this->faker->optional()->sentence(),
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(fn () => ['tenant_id' => $tenantId]);
    }
}
