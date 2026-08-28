<?php

namespace App\Services;

use App\Models\App\AccountPayable;
use App\Models\App\Order;
use App\Models\App\OrderCommission;
use App\Support\OrderStatus;
use Illuminate\Support\Facades\DB;

class TechnicianCommissionService
{
    public function __construct(private readonly AccountPayableService $accountPayableService) {}

    public function syncOrder(Order $order): ?OrderCommission
    {
        $order->loadMissing('user');

        $technician = $order->user;
        $percentage = $technician ? (float) ($technician->commission_percentage ?? 0) : 0;
        $isDelivered = (int) $order->service_status === OrderStatus::DELIVERED;
        $baseAmount = round((float) ($order->service_value ?? 0), 2);

        $existing = OrderCommission::where('order_id', $order->id)->first();

        if (! $isDelivered || ! $technician || $percentage <= 0 || $baseAmount <= 0) {
            if ($existing) {
                $this->removeCommission($existing);
            }

            return null;
        }

        $commissionAmount = round($baseAmount * $percentage / 100, 2);

        return DB::transaction(function () use ($order, $technician, $baseAmount, $percentage, $commissionAmount, $existing) {
            $billData = [
                'supplier_name' => $technician->name,
                'description' => 'Comissão OS '.$order->order_number,
                'category' => 'Comissão de técnico',
                'total_amount' => $commissionAmount,
                'due_date' => $order->delivery_date ?? now()->toDateString(),
            ];

            $bill = $existing?->accountPayable;

            if ($bill) {
                $bill = $this->accountPayableService->update($bill, $billData);
            } else {
                $bill = $this->accountPayableService->create([
                    ...$billData,
                    'source_type' => AccountPayable::SOURCE_TECHNICIAN_COMMISSION,
                ]);
            }

            $commission = OrderCommission::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'tenant_id' => $order->tenant_id,
                    'user_id' => $technician->id,
                    'account_payable_id' => $bill->id,
                    'base_amount' => $baseAmount,
                    'commission_percentage' => $percentage,
                    'commission_amount' => $commissionAmount,
                ]
            );

            if ((int) $bill->source_id !== (int) $commission->id) {
                $bill->forceFill(['source_id' => $commission->id])->saveQuietly();
            }

            return $commission;
        });
    }

    public function deleteForOrder(Order $order): void
    {
        $existing = OrderCommission::where('order_id', $order->id)->first();

        if ($existing) {
            $this->removeCommission($existing);
        }
    }

    private function removeCommission(OrderCommission $commission): void
    {
        $bill = $commission->accountPayable;
        $commission->delete();

        if ($bill && $bill->status !== AccountPayable::STATUS_PAID) {
            $this->accountPayableService->delete($bill);
        }
    }
}
