<?php

namespace App\Services;

use App\Models\App\AccountPayable;
use App\Models\App\AccountPayableLog;
use App\Support\TenantSequence;
use Illuminate\Support\Facades\DB;

class AccountPayableService
{
    public function create(array $data, ?int $userId = null): AccountPayable
    {
        return DB::transaction(function () use ($data, $userId) {
            $total = round((float) $data['total_amount'], 2);

            $bill = AccountPayable::create([
                ...$data,
                'bill_number' => TenantSequence::next(AccountPayable::class, 'bill_number'),
                'source_type' => $data['source_type'] ?? AccountPayable::SOURCE_MANUAL,
                'total_amount' => $total,
                'paid_amount' => 0,
                'balance_amount' => $total,
                'status' => AccountPayable::STATUS_PENDING,
                'created_by' => $userId,
            ]);

            $this->log($bill, $userId, 'created', [
                'total_amount' => $total,
                'due_date' => $bill->due_date?->toDateString(),
            ]);

            return $bill;
        });
    }

    public function update(AccountPayable $bill, array $data, ?int $userId = null): AccountPayable
    {
        $total = round((float) $data['total_amount'], 2);
        $paid = round((float) $bill->paid_amount, 2);

        $bill->update([
            ...$data,
            'total_amount' => $total,
            'balance_amount' => $this->balance($total, $paid),
            'status' => $bill->status === AccountPayable::STATUS_CANCELLED
                ? AccountPayable::STATUS_CANCELLED
                : $this->statusFor($total, $paid),
        ]);

        $this->log($bill, $userId, 'updated', [
            'total_amount' => $total,
        ]);

        return $bill->fresh();
    }

    public function registerPayment(AccountPayable $bill, array $data, ?int $userId = null): AccountPayable
    {
        $amount = round((float) $data['amount'], 2);
        $total = round((float) $bill->total_amount, 2);
        $paid = round(min($total, (float) $bill->paid_amount + $amount), 2);

        $bill->update([
            'paid_amount' => $paid,
            'balance_amount' => $this->balance($total, $paid),
            'status' => $this->statusFor($total, $paid),
            'payment_method' => $data['payment_method'] ?? $bill->payment_method,
            'last_paid_at' => $data['paid_at'] ?? now(),
        ]);

        $this->log($bill, $userId, 'payment_registered', [
            'amount' => $amount,
            'payment_method' => $data['payment_method'] ?? null,
        ]);

        return $bill->fresh();
    }

    public function delete(AccountPayable $bill): void
    {
        $bill->delete();
    }

    private function statusFor(float $total, float $paid): string
    {
        if ($paid <= 0) {
            return AccountPayable::STATUS_PENDING;
        }

        if ($paid + 0.009 < $total) {
            return AccountPayable::STATUS_PARTIAL;
        }

        return AccountPayable::STATUS_PAID;
    }

    private function balance(float $total, float $paid): float
    {
        return round(max(0, $total - $paid), 2);
    }

    private function log(AccountPayable $bill, ?int $userId, string $action, array $data = []): void
    {
        AccountPayableLog::create([
            'tenant_id' => $bill->tenant_id,
            'account_payable_id' => $bill->id,
            'user_id' => $userId,
            'action' => $action,
            'data' => $data,
        ]);
    }
}
