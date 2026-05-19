<?php

namespace App\Services;

use App\Models\App\AccountReceivable;
use App\Models\App\Order;
use App\Models\App\Sale;

class FinancialReceivableService
{
    public function syncOrder(Order $order): ?AccountReceivable
    {
        $order->loadMissing('orderPayments');

        $total = round((float) ($order->service_cost ?? 0), 2);

        if ($total <= 0) {
            $this->deleteSource(AccountReceivable::SOURCE_ORDER, (int) $order->id, (int) $order->tenant_id);

            return null;
        }

        $paid = round((float) $order->orderPayments->sum('amount'), 2);
        $lastPaidAt = $order->orderPayments->max('paid_at');

        return AccountReceivable::query()->updateOrCreate(
            [
                'tenant_id' => $order->tenant_id,
                'source_type' => AccountReceivable::SOURCE_ORDER,
                'source_id' => $order->id,
                'installment_number' => 1,
            ],
            [
                'customer_id' => $order->customer_id,
                'description' => 'OS '.$order->order_number,
                'total_amount' => $total,
                'paid_amount' => min($paid, $total),
                'balance_amount' => $this->balance($total, $paid),
                'due_date' => $order->delivery_forecast,
                'status' => $this->statusFor($total, $paid),
                'payment_method' => null,
                'installments_total' => 1,
                'last_paid_at' => $lastPaidAt,
            ]
        );
    }

    public function syncSale(Sale $sale): ?AccountReceivable
    {
        $total = round((float) ($sale->total_amount ?? 0), 2);

        if ($total <= 0) {
            $this->deleteSource(AccountReceivable::SOURCE_SALE, (int) $sale->id, (int) $sale->tenant_id);

            return null;
        }

        $paid = round((float) ($sale->paid_amount ?? 0), 2);
        $status = $sale->status === 'cancelled'
            ? AccountReceivable::STATUS_CANCELLED
            : $this->statusFor($total, $paid);

        return AccountReceivable::query()->updateOrCreate(
            [
                'tenant_id' => $sale->tenant_id,
                'source_type' => AccountReceivable::SOURCE_SALE,
                'source_id' => $sale->id,
                'installment_number' => 1,
            ],
            [
                'customer_id' => $sale->customer_id,
                'description' => 'Venda '.$sale->sales_number,
                'total_amount' => $total,
                'paid_amount' => min($paid, $total),
                'balance_amount' => $status === AccountReceivable::STATUS_CANCELLED ? 0 : $this->balance($total, $paid),
                'due_date' => $sale->created_at?->toDateString(),
                'status' => $status,
                'payment_method' => $sale->payment_method,
                'installments_total' => 1,
                'last_paid_at' => $paid > 0 ? $sale->created_at : null,
            ]
        );
    }

    public function deleteSource(string $sourceType, int $sourceId, ?int $tenantId = null): void
    {
        AccountReceivable::query()
            ->when($tenantId, fn ($query) => $query->where('tenant_id', $tenantId))
            ->where('source_type', $sourceType)
            ->where('source_id', $sourceId)
            ->delete();
    }

    private function statusFor(float $total, float $paid): string
    {
        if ($paid <= 0) {
            return AccountReceivable::STATUS_PENDING;
        }

        if ($paid + 0.009 < $total) {
            return AccountReceivable::STATUS_PARTIAL;
        }

        return AccountReceivable::STATUS_PAID;
    }

    private function balance(float $total, float $paid): float
    {
        return round(max(0, $total - $paid), 2);
    }
}
