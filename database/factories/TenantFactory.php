<?php

namespace Database\Factories;

use App\Models\Admin\Plan;
use App\Models\Tenant;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Eloquent\Factories\Factory;

class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition()
    {
        $faker = FakerFactory::create('pt_BR');

        return [
            'plan_id' => Plan::factory(),
            'name' => $this->faker->name,
            'company' => $this->faker->unique()->company,
            'cnpj' => $faker->unique()->cnpj, // Gera um CNPJ com 14 dígitos
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->phoneNumber,
            'whatsapp' => $this->faker->phoneNumber,
            'zip_code' => $this->faker->postcode,
            'state' => $this->faker->stateAbbr,
            'city' => $this->faker->city,
            'district' => 'Centro', // Faker não tem um provedor para bairro, usando um valor fixo
            'street' => $this->faker->streetName,
            'complement' => $this->faker->secondaryAddress,
            'number' => $this->faker->buildingNumber,
            'status' => 1, // Assumindo 1 como 'ativo'
            'subscription_status' => 'active',
            'last_payment_id' => null,
            'expires_at' => $this->faker->dateTimeBetween('+1 month', '+1 year'),
            'observations' => $this->faker->sentence,
        ];
    }
}
