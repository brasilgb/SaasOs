<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Expense;
use App\Models\App\ExpenseLog;
use App\Models\App\Other;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    private function logExpenseAction(Expense $expense, string $action, array $data = []): void
    {
        ExpenseLog::create([
            'expense_id' => $expense->id,
            'user_id' => Auth::id(),
            'action' => $action,
            'data' => $data === [] ? null : $data,
        ]);
    }

    private function canAccessExpensesFeature(): bool
    {
        $user = Auth::user();
        if (! $user instanceof User) {
            return false;
        }

        if (! $user->hasPermission('sales')) {
            return false;
        }

        if (! ($user->isAdministrator() || $user->isOperator() || $user->isRoot())) {
            return false;
        }

        return (bool) (Other::query()->value('enablesales') ?? false);
    }

    private function authorizeExpensesAccess(): ?Response
    {
        if ($this->canAccessExpensesFeature()) {
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
        if ($response = $this->authorizeExpensesAccess()) {
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
        if ($response = $this->authorizeExpensesAccess()) {
            return $response;
        }

        $validated = $request->validate([
            'expense_date' => 'required|date',
            'description' => 'required|string|max:255',
            'category' => 'nullable|string|max:120',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:2000',
        ]);

        DB::transaction(function () use ($validated) {
            $nextExpenseNumber = ((int) Expense::query()
                ->lockForUpdate()
                ->max('expense_number')) + 1;

            $expense = Expense::create([
                ...$validated,
                'expense_number' => $nextExpenseNumber,
                'created_by' => Auth::id(),
            ]);

            $this->logExpenseAction($expense, 'created', [
                'expense_number' => (int) $expense->expense_number,
                'amount' => (float) $expense->amount,
                'category' => $expense->category,
                'expense_date' => $expense->expense_date?->toDateString(),
            ]);
        });

        return back()->with('success', 'Despesa cadastrada com sucesso.');
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        if ($response = $this->authorizeExpensesAccess()) {
            return $response;
        }

        $validated = $request->validate([
            'expense_date' => 'required|date',
            'description' => 'required|string|max:255',
            'category' => 'nullable|string|max:120',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:2000',
        ]);

        $expense->update($validated);

        $this->logExpenseAction($expense, 'updated', [
            'amount' => (float) $expense->amount,
            'category' => $expense->category,
            'expense_date' => $expense->expense_date?->toDateString(),
        ]);

        return back()->with('success', 'Despesa atualizada com sucesso.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        if ($response = $this->authorizeExpensesAccess()) {
            return $response;
        }
        $expenseData = [
            'expense_number' => (int) $expense->expense_number,
            'amount' => (float) $expense->amount,
            'category' => $expense->category,
            'expense_date' => $expense->expense_date?->toDateString(),
            'description' => $expense->description,
        ];

        $this->logExpenseAction($expense, 'deleted', $expenseData);
        $expense->delete();

        return back()->with('success', 'Despesa excluída com sucesso.');
    }
}
