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
        // Para usar o CPF, é comum ter um provider customizado para o Faker.
        // Ex: https://github.com/faker-br/faker-br
        // Se já estiver configurado globalmente (ex: em AppServiceProvider), pode remover a linha abaixo.
        $faker = FakerFactory::create('pt_BR');

        return [
            "customer_number" => null,
            "name" => $faker->name,
            "cpfcnpj" => $faker->cpf(),
            "birth" => $faker->date('Y-m-d'),
            'email' => $faker->unique()->safeEmail,
            "zipcode" => $faker->postcode(),
            "state" => $faker->state,
            "city" => $faker->city,
            "district" => $faker->citySuffix,
            "street" => $faker->streetName,
            "complement" => 'Casa',
            "number" => $faker->buildingNumber,
            'phone' => $faker->phoneNumber,
            "contactname" => $faker->name,
            "whatsapp" => '5551995862789',
            "contactphone" => $faker->phoneNumber,
            "observations" => $faker->sentence
        ];
    }
    
        public function configure()
        {
            return $this->afterCreating(function (Customer $customer) {
                // Aqui o ID já existe
                $customer->update([
                    'customer_number' => $customer->id
                ]);
            });
        }

    /**
     * Configura a factory para um tenant específico, garantindo que
     * o customer_number seja sequencial para aquele tenant.
     *
     * @param int $tenantId
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function forTenant(int $tenantId)
    {
        return $this->state(function (array $attributes) use ($tenantId) {
            $maxCustomerNumber = Customer::where('tenant_id', $tenantId)->max('customer_number') ?? 0;

            return ['tenant_id' => $tenantId, 'customer_number' => $maxCustomerNumber + 1];
        });
    }
}
