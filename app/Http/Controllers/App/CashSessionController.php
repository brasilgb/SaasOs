<?php

namespace App\Http\Controllers\App;

use App\Events\CashSessionClosed;
use App\Events\CashSessionOpened;
use App\Http\Controllers\Controller;
use App\Models\App\CashSession;
use App\Models\App\OrderPayment;
use App\Models\App\Sale;
use App\Services\CashSessionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CashSessionController extends Controller
{
    public function __construct(private readonly CashSessionService $cashSessionService) {}

    private function authorizeCashSessionAccess(?CashSession $cashSession = null, string $ability = 'viewAny'): ?Response
    {
        $allowed = $cashSession
            ? Gate::allows($ability, $cashSession)
            : Gate::allows($ability, CashSession::class);

        if ($allowed) {
            return null;
        }

        if (request()->expectsJson()) {
            return response()->json([
                'message' => 'Módulo de caixa diário desabilitado ou acesso não permitido.',
            ], 403);
        }

        return redirect()->route('app.dashboard')->with('error', 'Módulo de caixa diário desabilitado ou acesso não permitido.');
    }

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

    public function index()
    {
        if ($response = $this->authorizeCashSessionAccess()) {
            return $response;
        }

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
            ->paginate(11)
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
        if ($response = $this->authorizeCashSessionAccess(null, 'create')) {
            return $response;
        }

        $request->merge([
            'opening_balance' => $this->normalizeMoneyInput($request->input('opening_balance')),
        ]);

        $validated = $request->validate([
            'opening_balance' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $cashSession = $this->cashSessionService->open($validated, (int) Auth::id());
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        event(new CashSessionOpened($cashSession->id, Auth::id(), [
            'opening_balance' => (float) $cashSession->opening_balance,
            'notes' => $validated['notes'] ?? null,
        ]));

        return back()->with('success', 'Caixa aberto com sucesso.');
    }

    public function close(Request $request, CashSession $cashSession): RedirectResponse
    {
        if ($response = $this->authorizeCashSessionAccess($cashSession, 'update')) {
            return $response;
        }

        $request->merge([
            'closing_balance' => $this->normalizeMoneyInput($request->input('closing_balance')),
            'manual_entries' => $this->normalizeMoneyInput($request->input('manual_entries')),
            'manual_exits' => $this->normalizeMoneyInput($request->input('manual_exits')),
        ]);

        $validated = $request->validate([
            'closing_balance' => 'required|numeric|min:0',
            'manual_entries' => 'nullable|numeric|min:0',
            'manual_exits' => 'nullable|numeric|min:0',
            'closing_notes' => 'nullable|string|max:1000',
        ]);
        try {
            $cashSession = $this->cashSessionService->close($cashSession, $validated, (int) Auth::id());
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $closingBalance = (float) $cashSession->closing_balance;
        $expectedBalance = (float) $cashSession->expected_balance;
        $difference = (float) $cashSession->difference;
        $totalCompletedSales = (float) $cashSession->total_completed_sales;
        $totalOrderPayments = (float) $cashSession->total_order_payments;
        $totalCancelledSales = (float) $cashSession->total_cancelled_sales;
        $manualEntries = (float) $cashSession->manual_entries;
        $manualExits = (float) $cashSession->manual_exits;

        $eventData = [
            'closing_balance' => $closingBalance,
            'expected_balance' => $expectedBalance,
            'difference' => $difference,
            'total_completed_sales' => (float) $totalCompletedSales,
            'total_order_payments' => (float) $totalOrderPayments,
            'total_cancelled_sales' => (float) $totalCancelledSales,
            'manual_entries' => $manualEntries,
            'manual_exits' => $manualExits,
            'closing_notes' => $validated['closing_notes'] ?? null,
        ];
        event(new CashSessionClosed($cashSession->id, Auth::id(), $eventData));

        return back()->with('success', 'Fechamento diário realizado com sucesso.');
    }
}
