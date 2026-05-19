<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('item_type', 20);
            $table->string('source_type', 30)->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->string('description');
            $table->decimal('quantity', 12, 3)->default(1);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'item_type']);
            $table->index(['order_id', 'item_type']);
            $table->index(['source_type', 'source_id']);
        });

        $this->backfillServiceItems();
        $this->backfillProductItems();
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }

    private function backfillServiceItems(): void
    {
        DB::table('orders')
            ->whereNotNull('tenant_id')
            ->where('service_value', '>', 0)
            ->select([
                'id',
                'tenant_id',
                'order_number',
                'budget_description',
                'services_performed',
                'service_value',
                'created_at',
                'updated_at',
            ])
            ->orderBy('id')
            ->chunkById(500, function ($orders): void {
                $now = now();
                $rows = $orders->map(function ($order) use ($now): array {
                    return [
                        'tenant_id' => $order->tenant_id,
                        'order_id' => $order->id,
                        'item_type' => 'service',
                        'source_type' => 'order_service',
                        'source_id' => null,
                        'description' => $order->services_performed
                            ?: ($order->budget_description ?: 'Serviço da OS '.$order->order_number),
                        'quantity' => 1,
                        'unit_price' => round((float) $order->service_value, 2),
                        'total_price' => round((float) $order->service_value, 2),
                        'unit_cost' => null,
                        'sort_order' => 10,
                        'meta' => null,
                        'created_at' => $order->created_at ?? $now,
                        'updated_at' => $order->updated_at ?? $now,
                    ];
                })->all();

                DB::table('order_items')->insert($rows);
            });
    }

    private function backfillProductItems(): void
    {
        DB::table('order_parts')
            ->join('orders', 'orders.id', '=', 'order_parts.order_id')
            ->join('parts', 'parts.id', '=', 'order_parts.part_id')
            ->whereNotNull('orders.tenant_id')
            ->select([
                'order_parts.id',
                'order_parts.order_id',
                'order_parts.part_id',
                'order_parts.quantity',
                'order_parts.created_at',
                'order_parts.updated_at',
                'orders.tenant_id',
                'parts.name',
                'parts.sale_price',
                'parts.cost_price',
            ])
            ->orderBy('order_parts.id')
            ->chunk(500, function ($parts): void {
                $now = now();
                $rows = $parts->map(function ($part) use ($now): array {
                    $quantity = (float) $part->quantity;
                    $unitPrice = round((float) $part->sale_price, 2);

                    return [
                        'tenant_id' => $part->tenant_id,
                        'order_id' => $part->order_id,
                        'item_type' => 'product',
                        'source_type' => 'part',
                        'source_id' => $part->part_id,
                        'description' => $part->name,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'total_price' => round($quantity * $unitPrice, 2),
                        'unit_cost' => $part->cost_price,
                        'sort_order' => 20,
                        'meta' => null,
                        'created_at' => $part->created_at ?? $now,
                        'updated_at' => $part->updated_at ?? $now,
                    ];
                })->all();

                DB::table('order_items')->insert($rows);
            });
    }
};
