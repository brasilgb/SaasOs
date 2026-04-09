<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Expense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    private function authorizeExpensesAccess(): void
    {
        abort_unless(Auth::user()?->hasPermission('sales'), 403);
    }

    public function index(Request $request)
    {
        $this->authorizeExpensesAccess();

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
        $this->authorizeExpensesAccess();

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

            Expense::create([
                ...$validated,
                'expense_number' => $nextExpenseNumber,
                'created_by' => Auth::id(),
            ]);
        });

        return back()->with('success', 'Despesa cadastrada com sucesso.');
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        $this->authorizeExpensesAccess();

        $validated = $request->validate([
            'expense_date' => 'required|date',
            'description' => 'required|string|max:255',
            'category' => 'nullable|string|max:120',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:2000',
        ]);

        $expense->update($validated);

        return back()->with('success', 'Despesa atualizada com sucesso.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $this->authorizeExpensesAccess();
        $expense->delete();

        return back()->with('success', 'Despesa excluída com sucesso.');
    }
}
