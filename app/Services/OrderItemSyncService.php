<?php

namespace App\Services;

use App\Models\App\Order;
use App\Models\App\OrderItem;

class OrderItemSyncService
{
    public function sync(Order $order): void
    {
        $order->loadMissing('orderParts');

        OrderItem::query()
            ->where('order_id', $order->id)
            ->delete();

        $this->syncServiceItem($order);
        $this->syncProductItems($order);
    }

    private function syncServiceItem(Order $order): void
    {
        $serviceValue = round((float) ($order->service_value ?? 0), 2);

        if ($serviceValue <= 0) {
            return;
        }

        OrderItem::query()->create([
            'tenant_id' => $order->tenant_id,
            'order_id' => $order->id,
            'item_type' => OrderItem::TYPE_SERVICE,
            'source_type' => OrderItem::SOURCE_ORDER_SERVICE,
            'source_id' => null,
            'description' => $order->services_performed
                ?: ($order->budget_description ?: 'Serviço da OS '.$order->order_number),
            'quantity' => 1,
            'unit_price' => $serviceValue,
            'total_price' => $serviceValue,
            'unit_cost' => null,
            'sort_order' => 10,
        ]);
    }

    private function syncProductItems(Order $order): void
    {
        $order->orderParts()
            ->orderBy('parts.name')
            ->get()
            ->each(function ($part, int $index) use ($order): void {
                $quantity = (float) ($part->pivot->quantity ?? 0);
                $unitPrice = round((float) ($part->sale_price ?? 0), 2);

                if ($quantity <= 0) {
                    return;
                }

                OrderItem::query()->create([
                    'tenant_id' => $order->tenant_id,
                    'order_id' => $order->id,
                    'item_type' => OrderItem::TYPE_PRODUCT,
                    'source_type' => OrderItem::SOURCE_PART,
                    'source_id' => $part->id,
                    'description' => $part->name,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => round($quantity * $unitPrice, 2),
                    'unit_cost' => $part->cost_price,
                    'sort_order' => 20 + $index,
                ]);
            });
    }
}
