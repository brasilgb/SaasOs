<?php

namespace App\Services;

use App\Models\App\CashSession;
use App\Models\App\CashSessionLog;
use App\Models\App\CashSessionMovement;
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
        $withdrawals = $this->totalWithdrawals($cashSession);
        $expectedBalance = (float) $cashSession->opening_balance + $totalCompletedSales + $totalOrderPayments + $manualEntries - $manualExits - $withdrawals;
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

    public function registerWithdrawal(CashSession $cashSession, array $data, int $userId): CashSessionMovement
    {
        if ($cashSession->status !== 'open') {
            throw new RuntimeException('Este caixa já está fechado.');
        }

        $amount = (float) $data['amount'];
        $availableBalance = $this->currentExpectedBalance($cashSession);

        if ($amount > $availableBalance) {
            throw new RuntimeException('O valor da sangria não pode ser maior que o saldo esperado atual.');
        }

        return DB::transaction(function () use ($cashSession, $data, $userId, $amount): CashSessionMovement {
            $movement = CashSessionMovement::create([
                'cash_session_id' => $cashSession->id,
                'user_id' => $userId,
                'type' => CashSessionMovement::TYPE_WITHDRAWAL,
                'amount' => $amount,
                'description' => $data['description'] ?? null,
            ]);

            CashSessionLog::create([
                'cash_session_id' => $cashSession->id,
                'user_id' => $userId,
                'action' => 'withdrawal_registered',
                'data' => [
                    'amount' => $amount,
                    'description' => $data['description'] ?? null,
                ],
            ]);

            return $movement;
        });
    }

    public function currentExpectedBalance(CashSession $cashSession): float
    {
        $totalCompletedSales = (float) Sale::query()
            ->where('cash_session_id', $cashSession->id)
            ->where('status', 'completed')
            ->sum('total_amount');

        $totalOrderPayments = (float) OrderPayment::query()
            ->where('cash_session_id', $cashSession->id)
            ->sum('amount');

        return (float) $cashSession->opening_balance + $totalCompletedSales + $totalOrderPayments - $this->totalWithdrawals($cashSession);
    }

    public function totalWithdrawals(CashSession $cashSession): float
    {
        return (float) CashSessionMovement::query()
            ->where('cash_session_id', $cashSession->id)
            ->where('type', CashSessionMovement::TYPE_WITHDRAWAL)
            ->sum('amount');
    }
}
