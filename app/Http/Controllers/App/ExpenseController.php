<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Expense;
use App\Models\App\ExpenseLog;
use App\Models\App\Other;
use App\Services\ExpenseService;
use App\Services\OperationalAuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function __construct(
        private readonly OperationalAuditService $operationalAuditService,
        private readonly ExpenseService $expenseService,
    ) {}

    private function logOperationalAudit(string $action, Expense $expense, array $data = []): void
    {
        $this->operationalAuditService->record($action, 'expense', $expense, Auth::id(), $data);
    }

    private function logExpenseAction(Expense $expense, string $action, array $data = []): void
    {
        ExpenseLog::create([
            'expense_id' => $expense->id,
            'user_id' => Auth::id(),
            'action' => $action,
            'data' => $data === [] ? null : $data,
        ]);
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Expense::class);

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
        $this->authorize('create', Expense::class);

        $validated = $request->validate([
            'expense_date' => 'required|date',
            'description' => 'required|string|max:255',
            'category' => 'nullable|string|max:120',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:2000',
        ]);

        $expense = $this->expenseService->create($validated, (int) Auth::id());

        $this->logExpenseAction($expense, 'created', [
            'expense_number' => (int) $expense->expense_number,
            'amount' => (float) $expense->amount,
            'category' => $expense->category,
            'expense_date' => $expense->expense_date?->toDateString(),
        ]);
        $this->logOperationalAudit('expense_created', $expense, [
            'expense_number' => (int) $expense->expense_number,
            'amount' => (float) $expense->amount,
            'category' => $expense->category,
            'expense_date' => $expense->expense_date?->toDateString(),
        ]);

        return back()->with('success', 'Despesa cadastrada com sucesso.');
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        $this->authorize('update', $expense);

        $validated = $request->validate([
            'expense_date' => 'required|date',
            'description' => 'required|string|max:255',
            'category' => 'nullable|string|max:120',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:2000',
        ]);

        $expense = $this->expenseService->update($expense, $validated);

        $this->logExpenseAction($expense, 'updated', [
            'amount' => (float) $expense->amount,
            'category' => $expense->category,
            'expense_date' => $expense->expense_date?->toDateString(),
        ]);
        $this->logOperationalAudit('expense_updated', $expense, [
            'amount' => (float) $expense->amount,
            'category' => $expense->category,
            'expense_date' => $expense->expense_date?->toDateString(),
        ]);

        return back()->with('success', 'Despesa atualizada com sucesso.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $this->authorize('delete', $expense);
        $expenseData = [
            'expense_number' => (int) $expense->expense_number,
            'amount' => (float) $expense->amount,
            'category' => $expense->category,
            'expense_date' => $expense->expense_date?->toDateString(),
            'description' => $expense->description,
        ];

        $this->logExpenseAction($expense, 'deleted', $expenseData);
        $this->logOperationalAudit('expense_deleted', $expense, $expenseData);
        $this->expenseService->delete($expense);

        return back()->with('success', 'Despesa excluída com sucesso.');
    }
}
