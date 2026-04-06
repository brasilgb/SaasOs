<?php

namespace Database\Factories\App;

use App\Models\App\Checklist;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Checklist>
 */
class ChecklistFactory extends Factory
{
    protected $model = Checklist::class;

    /**
     * @var array<int, int>
     */
    protected static array $tenantSequence = [];

    public function definition(): array
    {
        return [
            'checklist_number' => $this->faker->unique()->numberBetween(1, 999999),
            'checklist' => $this->faker->sentence(4),
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(function () use ($tenantId): array {
            $next = static::$tenantSequence[$tenantId]
                ?? (Checklist::query()->where('tenant_id', $tenantId)->max('checklist_number') ?? 0);
            $next++;
            static::$tenantSequence[$tenantId] = $next;

            return [
                'tenant_id' => $tenantId,
                'checklist_number' => $next,
            ];
        });
    }
}
