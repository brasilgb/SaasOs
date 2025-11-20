<?php

namespace Database\Factories\App;

use App\Models\App\SaleItem;
use App\Models\App\Customer;
use App\Models\App\Sale;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\App\Sale>
 */
class SaleFactory extends Factory
{
    protected $model = Sale::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'sales_number' => $this->faker->unique()->numberBetween(1, 10000),
            'tenant_id' => Tenant::factory(),
            'customer_id' => Customer::factory(),
            'total_amount' => $this->faker->randomFloat(2, 20, 1000),
        ];
    }

    /**
     * Configure the model factory.
     *
     * @return $this
     */
    public function configure()
    {
        return $this->afterCreating(function (Sale $sale) {
            $items = SaleItem::factory(rand(1, 3))->make();
            $totalAmount = 0;

            $items->each(function ($item) use ($sale, &$totalAmount) {
                $totalAmount += $item->quantity * $item->unit_price;
            });

            $sale->items()->saveMany($items);
            $sale->update(['total_amount' => $totalAmount]);
        });
    }
}
