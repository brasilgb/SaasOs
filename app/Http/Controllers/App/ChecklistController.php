<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChecklistRequest;
use App\Models\App\Checklist;
use App\Models\App\Equipment;
use App\Support\TenantSequence;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ChecklistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('checklists.access');

        $search = $request->search;
        $query = Checklist::with('equipment')->orderBy('id', 'DESC');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('checklist', 'like', "%{$search}%")
                    ->orWhereHas('equipment', function ($eq) use ($search) {
                        $eq->where('equipment', 'like', "%{$search}%");
                    });
            });
        }
        $checklists = $query->paginate(\App\Support\Pagination::perPage())->withQueryString();
        $equipments = Equipment::get();

        return Inertia::render('app/checklists/index', ['checklists' => $checklists, 'equipments' => $equipments]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ChecklistRequest $request): RedirectResponse
    {
        Gate::authorize('checklists.access');

        $request->validated();
        $data = $request->only(['equipment_id', 'checklist']);
        $data['checklist_number'] = TenantSequence::next(Checklist::class, 'checklist_number');
        Checklist::create($data);

        if ($request->query('return_to') === 'receipts') {
            return redirect()->route('app.receipts.index', ['tab' => 'checklists'])->with('success', 'Checklist cadastrado com sucesso');
        }

        return redirect()->route('app.register-checklists.index')->with('success', 'Checklist cadastrado com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(Checklist $checklist)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Checklist $checklist)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ChecklistRequest $request, Checklist $checklist): RedirectResponse
    {
        Gate::authorize('checklists.access');

        $request->validated();
        $data = $request->only(['equipment_id', 'checklist']);
        $checklist->update($data);

        if ($request->query('return_to') === 'receipts') {
            return redirect()->route('app.receipts.index', ['tab' => 'checklists'])->with('success', 'Checklist editado com sucesso');
        }

        return redirect()->route('app.register-checklists.index')->with('success', 'Checklist editado com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Checklist $checklist): RedirectResponse
    {
        Gate::authorize('checklists.access');

        $checklist->delete();

        if ($request->query('return_to') === 'receipts') {
            return redirect()->route('app.receipts.index', ['tab' => 'checklists'])->with('success', 'Checklist excluido com sucesso!');
        }

        return redirect()->route('app.register-checklists.index')->with('success', 'Checklist excluido com sucesso!');
    }
}
