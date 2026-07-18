<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\EquipmentRequest;
use App\Models\App\Equipment;
use App\Support\TenantSequence;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class EquipmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('equipments.access');

        $search = $request->search;
        $query = Equipment::orderBy('id', 'DESC');
        if ($search) {
            $query->where('equipment', 'like', '%'.$search.'%');
        }
        $equipments = $query->paginate(\App\Support\Pagination::perPage())->withQueryString();

        return Inertia::render('app/equipments/index', ['equipments' => $equipments]);
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
    public function store(EquipmentRequest $request): RedirectResponse
    {
        Gate::authorize('equipments.access');

        $request->validated();
        $data = $request->only(['equipment', 'chart']);
        $data['chart'] = $request->boolean('chart');
        $data['equipment_number'] = TenantSequence::next(Equipment::class, 'equipment_number');
        $equipment = Equipment::create($data);

        if ($request->boolean('_inline')) {
            return back()->with('equipment_saved', [
                'id' => $equipment->id,
                'equipment' => $equipment->equipment,
            ]);
        }

        return redirect()->route('app.register-equipments.index')->with('success', 'Equipamento cadastrado com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(Equipment $equipment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Equipment $equipment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(EquipmentRequest $request, Equipment $equipment)
    {
        Gate::authorize('equipments.access');

        $request->validated();
        $data = $request->only(['equipment', 'chart']);
        $data['chart'] = $request->boolean('chart');
        $equipment->update($data);

        if ($request->boolean('_inline')) {
            return back()->with('equipment_updated', [
                'id' => $equipment->id,
                'equipment' => $equipment->equipment,
            ]);
        }

        return redirect()->route('app.register-equipments.index')->with('success', 'Marca editada com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Equipment $equipment)
    {
        Gate::authorize('equipments.access');

        $equipmentId = $equipment->id;
        $equipment->delete();

        if ($request->boolean('_inline')) {
            return back()->with('equipment_deleted', [
                'id' => $equipmentId,
            ]);
        }

        return redirect()->route('app.register-equipments.index')->with('success', 'Marca excluida com sucesso!');
    }
}
