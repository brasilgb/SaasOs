<?php

namespace Database\Factories;

use App\Models\Admin\Plan;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition()
    {
        return [
            'plan_id' => Plan::query()->inRandomOrder()->value('id') ?? Plan::factory(),
            'name' => $this->faker->name,
            'company' => $this->faker->unique()->company,
            'cnpj' => $this->faker->unique()->numerify('##############'),
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->phoneNumber,
            'whatsapp' => $this->faker->phoneNumber,
            'zip_code' => $this->faker->postcode,
            'state' => $this->faker->stateAbbr,
            'city' => $this->faker->city,
            'district' => 'Centro',
            'street' => $this->faker->streetName,
            'complement' => $this->faker->secondaryAddress,
            'number' => $this->faker->buildingNumber,
            'status' => 1,
            'subscription_status' => 'active',
            'last_payment_id' => null,
            'expires_at' => $this->faker->dateTimeBetween('+1 month', '+1 year'),
            'observations' => $this->faker->sentence,
        ];
    }
}
