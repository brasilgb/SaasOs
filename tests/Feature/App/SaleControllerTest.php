<?php

namespace Tests\Feature\App;

use App\Models\App\Customer;
use App\Models\App\Part;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SaleControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create(['name' => 'Test Tenant']);
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);

        $this->actingAs($this->user);
    }

    /** @test */
    public function it_can_create_a_sale()
    {
        $customer = Customer::factory()->create(['tenant_id' => $this->tenant->id]);
        $part1 = Part::factory()->create(['tenant_id' => $this->tenant->id, 'quantity' => 10, 'sale_price' => 100]);
        $part2 = Part::factory()->create(['tenant_id' => $this->tenant->id, 'quantity' => 5, 'sale_price' => 200]);

        $saleData = [
            'customer_id' => $customer->id,
            'total_amount' => 400,
            'parts' => [
                ['part_id' => $part1->id, 'quantity' => 2],
                ['part_id' => $part2->id, 'quantity' => 1],
            ],
        ];

        $response = $this->post(route('app.sales.store'), $saleData);

        $response->assertRedirect(route('app.dashboard'));
        $response->assertSessionHas('success', 'Venda realizada com sucesso!');

        $this->assertDatabaseHas('sales', [
            'customer_id' => $customer->id,
            'total_amount' => 400,
        ]);

        $this->assertDatabaseHas('sale_items', [
            'part_id' => $part1->id,
            'quantity' => 2,
            'unit_price' => 100,
        ]);

        $this->assertDatabaseHas('sale_items', [
            'part_id' => $part2->id,
            'quantity' => 1,
            'unit_price' => 200,
        ]);

        $this->assertEquals(8, $part1->fresh()->quantity);
        $this->assertEquals(4, $part2->fresh()->quantity);
    }
}
