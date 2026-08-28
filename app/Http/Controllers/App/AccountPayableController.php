<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\AccountPayable;
use App\Services\AccountPayableService;
use App\Support\Pagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class AccountPayableController extends Controller
{
    public function __construct(private readonly AccountPayableService $accountPayableService) {}

    private function authorizeAccountPayableAccess(?AccountPayable $bill = null, string $ability = 'viewAny'): ?Response
    {
        $allowed = $bill
            ? Gate::allows($ability, $bill)
            : Gate::allows($ability, AccountPayable::class);

        if ($allowed) {
            return null;
        }

        if (request()->expectsJson()) {
            return response()->json([
                'message' => 'Módulo financeiro desabilitado ou acesso não permitido.',
            ], 403);
        }

        return redirect()->route('app.dashboard')->with('error', 'Módulo financeiro desabilitado ou acesso não permitido.');
    }

    public function index(Request $request)
    {
        if ($response = $this->authorizeAccountPayableAccess()) {
            return $response;
        }

        $search = trim((string) $request->get('search', ''));
        $status = trim((string) $request->get('status', ''));

        $query = AccountPayable::query()
            ->with('createdBy:id,name')
            ->orderByRaw("FIELD(status, 'pending', 'partial', 'paid', 'cancelled')")
            ->orderBy('due_date');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('bill_number', 'like', '%'.$search.'%')
                    ->orWhere('supplier_name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        }

        if (in_array($status, [AccountPayable::STATUS_PENDING, AccountPayable::STATUS_PARTIAL, AccountPayable::STATUS_PAID, AccountPayable::STATUS_CANCELLED], true)) {
            $query->where('status', $status);
        }

        $bills = $query->paginate(Pagination::perPage())->withQueryString();

        $totals = [
            'open_balance' => (float) AccountPayable::query()
                ->whereIn('status', [AccountPayable::STATUS_PENDING, AccountPayable::STATUS_PARTIAL])
                ->sum('balance_amount'),
            'overdue_count' => AccountPayable::query()
                ->whereIn('status', [AccountPayable::STATUS_PENDING, AccountPayable::STATUS_PARTIAL])
                ->whereDate('due_date', '<', now()->toDateString())
                ->count(),
        ];

        return Inertia::render('app/accounts-payable/index', [
            'bills' => $bills,
            'search' => $search,
            'status' => $status,
            'totals' => $totals,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if ($response = $this->authorizeAccountPayableAccess(null, 'create')) {
            return $response;
        }

        $validated = $request->validate([
            'supplier_name' => 'nullable|string|max:255',
            'description' => 'required|string|max:500',
            'category' => 'nullable|string|max:120',
            'total_amount' => 'required|numeric|min:0.01',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $this->accountPayableService->create($validated, (int) Auth::id());

        return back()->with('success', 'Conta a pagar cadastrada com sucesso.');
    }

    public function update(Request $request, AccountPayable $accounts_payable): RedirectResponse
    {
        if ($response = $this->authorizeAccountPayableAccess($accounts_payable, 'update')) {
            return $response;
        }

        $validated = $request->validate([
            'supplier_name' => 'nullable|string|max:255',
            'description' => 'required|string|max:500',
            'category' => 'nullable|string|max:120',
            'total_amount' => 'required|numeric|min:0.01',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $this->accountPayableService->update($accounts_payable, $validated, (int) Auth::id());

        return back()->with('success', 'Conta a pagar atualizada com sucesso.');
    }

    public function registerPayment(Request $request, AccountPayable $accounts_payable): RedirectResponse
    {
        if ($response = $this->authorizeAccountPayableAccess($accounts_payable, 'update')) {
            return $response;
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:'.max(0.01, (float) $accounts_payable->balance_amount)],
            'payment_method' => 'nullable|string|max:40',
            'paid_at' => 'nullable|date',
        ]);

        $this->accountPayableService->registerPayment($accounts_payable, $validated, (int) Auth::id());

        return back()->with('success', 'Pagamento registrado com sucesso.');
    }

    public function destroy(AccountPayable $accounts_payable): RedirectResponse
    {
        if ($response = $this->authorizeAccountPayableAccess($accounts_payable, 'delete')) {
            return $response;
        }

        $this->accountPayableService->delete($accounts_payable);

        return back()->with('success', 'Conta a pagar excluída com sucesso.');
    }
}
