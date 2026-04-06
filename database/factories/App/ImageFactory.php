<?php

namespace Database\Factories\App;

use App\Models\App\Image;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Image>
 */
class ImageFactory extends Factory
{
    protected $model = Image::class;

    public function definition(): array
    {
        return [
            'filename' => sprintf(
                'os_%s_%s.jpg',
                $this->faker->numberBetween(1, 9999),
                $this->faker->lexify('????')
            ),
        ];
    }

    public function forTenant(int $tenantId): static
    {
        return $this->state(fn () => ['tenant_id' => $tenantId]);
    }
}
