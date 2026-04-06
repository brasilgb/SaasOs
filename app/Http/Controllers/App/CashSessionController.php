<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\CashSession;
use App\Models\App\OrderPayment;
use App\Models\App\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CashSessionController extends Controller
{
    private function normalizeMoneyInput(mixed $value): ?float
    {
        if ($value === null) {
            return null;
        }

        $raw = trim((string) $value);
        if ($raw === '') {
            return null;
        }

        // "1.234,56" -> "1234.56"
        $normalized = str_contains($raw, ',')
            ? str_replace(',', '.', str_replace('.', '', $raw))
            : str_replace(',', '', $raw);

        return is_numeric($normalized) ? (float) $normalized : null;
    }

    private function authorizeSalesAccess(): void
    {
        abort_unless(Auth::user()?->hasPermission('sales'), 403);
    }

    public function index()
    {
        $this->authorizeSalesAccess();

        $currentSession = CashSession::query()
            ->with(
                'openedBy:id,name',
                'closedBy:id,name',
                'orderPayments:id,cash_session_id,amount,payment_method',
                'sales:id,cash_session_id,total_amount,payment_method,status'
            )
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        $sessions = CashSession::query()
            ->with(
                'openedBy:id,name',
                'closedBy:id,name',
                'orderPayments:id,cash_session_id,amount,payment_method',
                'sales:id,cash_session_id,total_amount,payment_method,status'
            )
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        $openTotals = [
            'completed_sales' => 0,
            'cancelled_sales' => 0,
            'order_payments' => 0,
            'total_received' => 0,
        ];

        if ($currentSession) {
            $openTotals['completed_sales'] = (float) Sale::query()
                ->where('cash_session_id', $currentSession->id)
                ->where('status', 'completed')
                ->sum('total_amount');

            $openTotals['cancelled_sales'] = (float) Sale::query()
                ->where('cash_session_id', $currentSession->id)
                ->where('status', 'cancelled')
                ->sum('total_amount');

            $openTotals['order_payments'] = (float) OrderPayment::query()
                ->where('cash_session_id', $currentSession->id)
                ->sum('amount');

            $openTotals['total_received'] = $openTotals['completed_sales'] + $openTotals['order_payments'];
        }

        return Inertia::render('app/cashier/index', [
            'currentSession' => $currentSession,
            'sessions' => $sessions,
            'openTotals' => $openTotals,
        ]);
    }

    public function open(Request $request): RedirectResponse
    {
        $this->authorizeSalesAccess();

        $request->merge([
            'opening_balance' => $this->normalizeMoneyInput($request->input('opening_balance')),
        ]);

        $hasOpenSession = CashSession::query()
            ->where('status', 'open')
            ->exists();

        if ($hasOpenSession) {
            return back()->with('error', 'Já existe um caixa aberto para este tenant.');
        }

        $validated = $request->validate([
            'opening_balance' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        CashSession::create([
            'opened_by' => Auth::id(),
            'opened_at' => now(),
            'opening_balance' => (float) ($validated['opening_balance'] ?? 0),
            'status' => 'open',
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Caixa aberto com sucesso.');
    }

    public function close(Request $request, CashSession $cashSession): RedirectResponse
    {
        $this->authorizeSalesAccess();

        $request->merge([
            'closing_balance' => $this->normalizeMoneyInput($request->input('closing_balance')),
            'manual_entries' => $this->normalizeMoneyInput($request->input('manual_entries')),
            'manual_exits' => $this->normalizeMoneyInput($request->input('manual_exits')),
        ]);

        if ($cashSession->status !== 'open') {
            return back()->with('error', 'Este caixa já está fechado.');
        }

        $validated = $request->validate([
            'closing_balance' => 'required|numeric|min:0',
            'manual_entries' => 'nullable|numeric|min:0',
            'manual_exits' => 'nullable|numeric|min:0',
            'closing_notes' => 'nullable|string|max:1000',
        ]);

        $totalCompletedSales = Sale::query()
            ->where('cash_session_id', $cashSession->id)
            ->where('status', 'completed')
            ->sum('total_amount');

        $totalCancelledSales = Sale::query()
            ->where('cash_session_id', $cashSession->id)
            ->where('status', 'cancelled')
            ->sum('total_amount');

        $totalOrderPayments = OrderPayment::query()
            ->where('cash_session_id', $cashSession->id)
            ->sum('amount');

        $manualEntries = (float) ($validated['manual_entries'] ?? 0);
        $manualExits = (float) ($validated['manual_exits'] ?? 0);
        $expectedBalance = (float) $cashSession->opening_balance
            + (float) $totalCompletedSales
            + (float) $totalOrderPayments
            + $manualEntries
            - $manualExits;
        $closingBalance = (float) $validated['closing_balance'];
        $difference = $closingBalance - $expectedBalance;

        $cashSession->update([
            'closed_by' => Auth::id(),
            'closed_at' => now(),
            'closing_balance' => $closingBalance,
            'expected_balance' => $expectedBalance,
            'difference' => $difference,
            'total_completed_sales' => (float) $totalCompletedSales,
            'total_order_payments' => (float) $totalOrderPayments,
            'total_cancelled_sales' => (float) $totalCancelledSales,
            'manual_entries' => $manualEntries,
            'manual_exits' => $manualExits,
            'status' => 'closed',
            'closing_notes' => $validated['closing_notes'] ?? null,
        ]);

        return back()->with('success', 'Fechamento diário realizado com sucesso.');
    }
}
