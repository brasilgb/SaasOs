<?php

namespace Database\Factories\App;

use App\Models\App\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Company>
 */
class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        return [
            'shortname' => $this->faker->companySuffix(),
            'companyname' => $this->faker->company(),
            'cnpj' => $this->faker->numerify('##############'),
            'logo' => null,
            'zip_code' => $this->faker->postcode(),
            'state' => $this->faker->stateAbbr(),
            'city' => $this->faker->city(),
            'district' => 'Centro',
            'street' => $this->faker->streetName(),
            'number' => (string) $this->faker->numberBetween(1, 2000),
            'complement' => $this->faker->optional()->secondaryAddress(),
            'telephone' => $this->faker->phoneNumber(),
            'whatsapp' => $this->faker->phoneNumber(),
            'site' => 'https://'.$this->faker->domainName(),
            'email' => $this->faker->safeEmail(),
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(fn () => ['tenant_id' => $tenantId]);
    }
}
