<?php

namespace Database\Factories;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;
    /**
     * @var array<int, int>
     */
    protected static array $tenantSequence = [];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tenant = Tenant::query()->inRandomOrder()->first() ?? Tenant::factory()->create();
        $tenantId = (int) $tenant->id;
        $nextUserNumber = static::$tenantSequence[$tenantId]
            ?? (User::query()->where('tenant_id', $tenantId)->max('user_number') ?? 0);
        $nextUserNumber++;
        static::$tenantSequence[$tenantId] = $nextUserNumber;

        return [
            'tenant_id' => $tenantId,
            'user_number' => $nextUserNumber,
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'telephone' => fake()->phoneNumber(),
            'whatsapp' => fake()->phoneNumber(),
            'password' => static::$password ??= Hash::make('password'),
            'roles' => User::ROLE_ADMIN,
            'status' => 1,
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(function () use ($tenantId): array {
            $nextUserNumber = static::$tenantSequence[$tenantId]
                ?? (User::query()->where('tenant_id', $tenantId)->max('user_number') ?? 0);
            $nextUserNumber++;
            static::$tenantSequence[$tenantId] = $nextUserNumber;

            return [
                'tenant_id' => $tenantId,
                'user_number' => $nextUserNumber,
            ];
        });
    }
}
