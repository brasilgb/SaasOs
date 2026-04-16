<?php

namespace App\Services;

use App\Models\App\CashSession;
use App\Models\App\OrderPayment;
use App\Models\App\Sale;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CashSessionService
{
    public function open(array $data, int $userId): CashSession
    {
        $hasOpenSession = CashSession::query()
            ->where('status', 'open')
            ->exists();

        if ($hasOpenSession) {
            throw new RuntimeException('Já existe um caixa aberto para este tenant.');
        }

        return CashSession::create([
            'opened_by' => $userId,
            'opened_at' => now(),
            'opening_balance' => (float) ($data['opening_balance'] ?? 0),
            'status' => 'open',
            'notes' => $data['notes'] ?? null,
        ]);
    }

    public function close(CashSession $cashSession, array $data, int $userId): CashSession
    {
        if ($cashSession->status !== 'open') {
            throw new RuntimeException('Este caixa já está fechado.');
        }

        $totalCompletedSales = (float) Sale::query()
            ->where('cash_session_id', $cashSession->id)
            ->where('status', 'completed')
            ->sum('total_amount');

        $totalCancelledSales = (float) Sale::query()
            ->where('cash_session_id', $cashSession->id)
            ->where('status', 'cancelled')
            ->sum('total_amount');

        $totalOrderPayments = (float) OrderPayment::query()
            ->where('cash_session_id', $cashSession->id)
            ->sum('amount');

        $manualEntries = (float) ($data['manual_entries'] ?? 0);
        $manualExits = (float) ($data['manual_exits'] ?? 0);
        $expectedBalance = (float) $cashSession->opening_balance + $totalCompletedSales + $totalOrderPayments + $manualEntries - $manualExits;
        $closingBalance = (float) $data['closing_balance'];
        $difference = $closingBalance - $expectedBalance;

        $cashSession->update([
            'closed_by' => $userId,
            'closed_at' => now(),
            'closing_balance' => $closingBalance,
            'expected_balance' => $expectedBalance,
            'difference' => $difference,
            'total_completed_sales' => $totalCompletedSales,
            'total_order_payments' => $totalOrderPayments,
            'total_cancelled_sales' => $totalCancelledSales,
            'manual_entries' => $manualEntries,
            'manual_exits' => $manualExits,
            'status' => 'closed',
            'closing_notes' => $data['closing_notes'] ?? null,
        ]);

        return $cashSession->fresh();
    }
}
