<?php

namespace App\Services;

use App\Models\App\Order;
use App\Models\App\OrderStatusHistory;
use App\Support\OrderStatus;
use Illuminate\Validation\ValidationException;

class OrderStatusService
{
    public function transition(Order $order, int $toStatus, ?int $changedBy = null, ?string $note = null): Order
    {
        $fromStatus = (int) $order->service_status;

        if (! OrderStatus::canTransition($fromStatus, $toStatus)) {
            throw ValidationException::withMessages([
                'service_status' => sprintf(
                    'Transição inválida de status: %s para %s.',
                    OrderStatus::label($fromStatus),
                    OrderStatus::label($toStatus)
                ),
            ]);
        }

        if ($fromStatus === $toStatus) {
            return $order;
        }

        $order->update([
            'service_status' => $toStatus,
        ]);

        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => $toStatus,
            'changed_by' => $changedBy,
            'note' => $note ?? OrderStatus::label($toStatus),
        ]);

        return $order->fresh();
    }
}
