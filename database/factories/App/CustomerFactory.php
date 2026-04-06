<?php

namespace Database\Factories\App;

use App\Models\App\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    /**
     * @var array<int, int>
     */
    protected static array $tenantSequence = [];

    public function definition(): array
    {
        return [
            'customer_number' => $this->faker->unique()->numberBetween(1, 999999),
            'name' => $this->faker->name(),
            'cpfcnpj' => preg_replace('/\D+/', '', $this->faker->numerify('###########')),
            'birth' => $this->faker->optional()->date('Y-m-d'),
            'email' => $this->faker->unique()->safeEmail(),
            'zipcode' => $this->faker->postcode(),
            'state' => $this->faker->stateAbbr(),
            'city' => $this->faker->city(),
            'district' => $this->faker->citySuffix(),
            'street' => $this->faker->streetName(),
            'complement' => $this->faker->optional()->secondaryAddress(),
            'number' => $this->faker->numberBetween(1, 9999),
            'phone' => $this->faker->phoneNumber(),
            'contactname' => $this->faker->name(),
            'whatsapp' => $this->faker->phoneNumber(),
            'contactphone' => $this->faker->phoneNumber(),
            'observations' => $this->faker->optional()->sentence(),
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(function () use ($tenantId): array {
            $next = static::$tenantSequence[$tenantId]
                ?? (Customer::query()->where('tenant_id', $tenantId)->max('customer_number') ?? 0);

            $next++;
            static::$tenantSequence[$tenantId] = $next;

            return [
                'tenant_id' => $tenantId,
                'customer_number' => $next,
            ];
        });
    }
}
