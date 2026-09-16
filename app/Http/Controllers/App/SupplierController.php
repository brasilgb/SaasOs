<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\SupplierRequest;
use App\Models\App\Supplier;
use App\Support\Pagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('suppliers.access');

        $search = trim((string) $request->get('search', ''));

        $query = Supplier::query()->orderBy('name');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('document', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            });
        }

        $suppliers = $query->paginate(Pagination::perPage())->withQueryString();

        return Inertia::render('app/suppliers/index', [
            'suppliers' => $suppliers,
            'search' => $search,
        ]);
    }

    public function store(SupplierRequest $request): RedirectResponse
    {
        Gate::authorize('suppliers.access');

        Supplier::create($request->validated());

        return back()->with('success', 'Fornecedor cadastrado com sucesso.');
    }

    public function update(SupplierRequest $request, Supplier $supplier): RedirectResponse
    {
        Gate::authorize('suppliers.access');

        $supplier->update($request->validated());

        return back()->with('success', 'Fornecedor atualizado com sucesso.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        Gate::authorize('suppliers.access');

        $supplier->delete();

        return back()->with('success', 'Fornecedor excluído com sucesso.');
    }
}
