<?php

namespace App\Http\Controllers\App;

use App\Models\App\Equipment;
use App\Http\Controllers\Controller;
use App\Http\Requests\EquipmentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EquipmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');
        $query = Equipment::orderBy('id', 'DESC');
        if ($search) {
            $query->where('equipment', 'like', '%' . $search . '%');
        }
        $equipments = $query->paginate(12);
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
        $data = $request->all();
        $request->validated();
        $data['equipment_number'] = Equipment::exists() ? Equipment::latest()->first()->equipment_number + 1 : 1;
        Equipment::create($data);
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
        $data = $request->all();
        $request->validated();
        $equipment->update($data);
        return redirect()->route('app.register-equipments.index')->with('success', 'Marca editada com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Equipment $equipment)
    {
        $equipment->delete();
        return redirect()->route('app.register-equipments.index')->with('success', 'Marca excluida com sucesso!');
    }
}
