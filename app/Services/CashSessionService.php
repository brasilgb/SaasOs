<?php

namespace App\Services;

use App\Events\CashSessionWithdrawalRegistered;
use App\Events\CashSessionWithdrawalCancelled;
use App\Models\App\CashSession;
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
        $cashEntries = $this->totalEntries($cashSession);
        $withdrawals = $this->totalWithdrawals($cashSession);
        $expectedBalance = (float) $cashSession->opening_balance + $totalCompletedSales + $totalOrderPayments + $cashEntries + $manualEntries - $manualExits - $withdrawals;
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

    public function registerEntry(CashSession $cashSession, array $data, int $userId): CashSessionMovement
    {
        if ($cashSession->status !== 'open') {
            throw new RuntimeException('Este caixa já está fechado.');
        }

        $amount = (float) $data['amount'];

        if ($amount <= 0) {
            throw new RuntimeException('Informe um valor maior que zero para registrar a entrada.');
        }

        return CashSessionMovement::create([
            'cash_session_id' => $cashSession->id,
            'user_id' => $userId,
            'type' => CashSessionMovement::TYPE_ENTRY,
            'amount' => $amount,
            'description' => $data['description'] ?? null,
            'source_type' => $data['source_type'] ?? null,
            'source_id' => $data['source_id'] ?? null,
        ]);
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

        $movement = DB::transaction(function () use ($cashSession, $data, $userId, $amount): CashSessionMovement {
            $movement = CashSessionMovement::create([
                'cash_session_id' => $cashSession->id,
                'user_id' => $userId,
                'type' => CashSessionMovement::TYPE_WITHDRAWAL,
                'amount' => $amount,
                'description' => $data['description'] ?? null,
            ]);

            return $movement;
        });

        event(new CashSessionWithdrawalRegistered($cashSession->id, $userId, [
            'movement_id' => $movement->id,
            'amount' => $amount,
            'description' => $data['description'] ?? null,
        ]));

        return $movement;
    }

    public function cancelWithdrawal(CashSession $cashSession, CashSessionMovement $movement, array $data, int $userId): CashSessionMovement
    {
        if ($cashSession->status !== 'open') {
            throw new RuntimeException('Este caixa já está fechado.');
        }

        if ((int) $movement->cash_session_id !== (int) $cashSession->id || $movement->type !== CashSessionMovement::TYPE_WITHDRAWAL) {
            throw new RuntimeException('Sangria não encontrada para este caixa.');
        }

        if ($movement->cancelled_at) {
            throw new RuntimeException('Esta sangria já está cancelada.');
        }

        $movement = DB::transaction(function () use ($movement, $data, $userId): CashSessionMovement {
            $movement->update([
                'cancelled_at' => now(),
                'cancelled_by' => $userId,
                'cancellation_reason' => $data['cancellation_reason'] ?? null,
            ]);

            return $movement->fresh();
        });

        event(new CashSessionWithdrawalCancelled($cashSession->id, $userId, [
            'movement_id' => $movement->id,
            'amount' => (float) $movement->amount,
            'description' => $movement->description,
            'cancellation_reason' => $movement->cancellation_reason,
        ]));

        return $movement;
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

        return (float) $cashSession->opening_balance + $totalCompletedSales + $totalOrderPayments + $this->totalEntries($cashSession) - $this->totalWithdrawals($cashSession);
    }

    public function totalEntries(CashSession $cashSession): float
    {
        return (float) CashSessionMovement::query()
            ->where('cash_session_id', $cashSession->id)
            ->where('type', CashSessionMovement::TYPE_ENTRY)
            ->whereNull('cancelled_at')
            ->sum('amount');
    }

    public function totalWithdrawals(CashSession $cashSession): float
    {
        return (float) CashSessionMovement::query()
            ->where('cash_session_id', $cashSession->id)
            ->where('type', CashSessionMovement::TYPE_WITHDRAWAL)
            ->whereNull('cancelled_at')
            ->sum('amount');
    }
}
