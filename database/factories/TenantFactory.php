<?php

namespace Database\Factories;

use App\Models\Admin\Plan;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Faker\Factory as FakerFactory;

class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition()
    {
        $faker = FakerFactory::create('pt_BR');
        return [
            'plan' => fn () => Plan::inRandomOrder()->first()->id,
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
            'payment' => $this->faker->boolean,
            'observations' => $this->faker->sentence,
            'expiration_date' => $this->faker->dateTimeBetween('+1 month', '+1 year'),
        ];
    }
}
