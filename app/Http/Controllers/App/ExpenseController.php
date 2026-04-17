<?php

namespace App\Http\Controllers\App;

use App\Events\ExpenseCreated;
use App\Events\ExpenseDeleted;
use App\Events\ExpenseUpdated;
use App\Http\Controllers\Controller;
use App\Models\App\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ExpenseController extends Controller
{
    public function __construct(private readonly ExpenseService $expenseService) {}

    private function authorizeExpenseAccess(?Expense $expense = null, string $ability = 'viewAny'): ?Response
    {
        $allowed = $expense
            ? Gate::allows($ability, $expense)
            : Gate::allows($ability, Expense::class);

        if ($allowed) {
            return null;
        }

        if (request()->expectsJson()) {
            return response()->json([
                'message' => 'Módulo de vendas desabilitado ou acesso não permitido.',
            ], 403);
        }

        return redirect()->route('app.dashboard')->with('error', 'Módulo de vendas desabilitado ou acesso não permitido.');
    }

    public function index(Request $request)
    {
        if ($response = $this->authorizeExpenseAccess()) {
            return $response;
        }

        $search = trim((string) $request->get('search', ''));
        $category = trim((string) $request->get('category', ''));

        $query = Expense::query()
            ->with('createdBy:id,name')
            ->orderByDesc('expense_date')
            ->orderByDesc('expense_number');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('expense_number', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('notes', 'like', '%'.$search.'%');
            });
        }

        if ($category !== '') {
            $query->where('category', 'like', '%'.$category.'%');
        }

        $expenses = $query->paginate(11)->withQueryString();

        return Inertia::render('app/expenses/index', [
            'expenses' => $expenses,
            'search' => $search,
            'category' => $category,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if ($response = $this->authorizeExpenseAccess(null, 'create')) {
            return $response;
        }

        $validated = $request->validate([
            'expense_date' => 'required|date',
            'description' => 'required|string|max:255',
            'category' => 'nullable|string|max:120',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:2000',
        ]);

        $expense = $this->expenseService->create($validated, (int) Auth::id());

        event(new ExpenseCreated($expense->id, Auth::id(), [
            'expense_number' => (int) $expense->expense_number,
            'amount' => (float) $expense->amount,
            'category' => $expense->category,
            'expense_date' => $expense->expense_date?->toDateString(),
        ]));

        return back()->with('success', 'Despesa cadastrada com sucesso.');
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        if ($response = $this->authorizeExpenseAccess($expense, 'update')) {
            return $response;
        }

        $validated = $request->validate([
            'expense_date' => 'required|date',
            'description' => 'required|string|max:255',
            'category' => 'nullable|string|max:120',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:2000',
        ]);

        $expense = $this->expenseService->update($expense, $validated);

        event(new ExpenseUpdated($expense->id, Auth::id(), [
            'amount' => (float) $expense->amount,
            'category' => $expense->category,
            'expense_date' => $expense->expense_date?->toDateString(),
        ]));

        return back()->with('success', 'Despesa atualizada com sucesso.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        if ($response = $this->authorizeExpenseAccess($expense, 'delete')) {
            return $response;
        }
        $expenseData = [
            'expense_number' => (int) $expense->expense_number,
            'amount' => (float) $expense->amount,
            'category' => $expense->category,
            'expense_date' => $expense->expense_date?->toDateString(),
            'description' => $expense->description,
        ];

        event(new ExpenseDeleted($expense->id, Auth::id(), $expenseData));
        $this->expenseService->delete($expense);

        return back()->with('success', 'Despesa excluída com sucesso.');
    }
}
