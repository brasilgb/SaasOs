<?php

namespace Database\Factories\App;

use App\Models\App\Customer;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Faker\Factory as FakerFactory;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;
    public function definition()
    {
        $faker = FakerFactory::create('pt_BR');
        return [
            "tenant_id" => Tenant::factory(),
            "customer_number" => Customer::exists() ? Customer::latest()->first()->customer_number + 1 : 1,
            'name' => $this->faker->name,
            "cpf" => $faker->cpf(),
            "birth" => $this->faker->date('Y-m-d'),
            'email' => $this->faker->unique()->safeEmail,
            "cep" => $faker->postcode(),
            "state" => $this->faker->state,
            "city" => $this->faker->city,
            "district" => $faker->bairro(),
            "street" => $this->faker->street,
            "complement" => $this->faker->sentence,
            "number" => $this->faker->buildingNumber,
            'phone' => $this->faker->phoneNumber,
            "contactname" => $this->faker->name,
            "whatsapp" => $this->faker->phoneNumber,
            "contactphone" => $this->faker->phoneNumber,
            "observations" => $this->faker->sentence,
            "created_at",
            "updated_at",
        ];
    }
}
