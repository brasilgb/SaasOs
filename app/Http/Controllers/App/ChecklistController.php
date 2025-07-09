<?php

namespace App\Http\Controllers\App;
    
use App\Models\App\Checklist;
use App\Http\Controllers\Controller;
use App\Http\Requests\ChecklistRequest;
use App\Models\App\Equipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChecklistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');
        $query = Checklist::with('equipment')->orderBy('id', 'DESC');
        if ($search) {
            $query->where('checklist', 'like', '%' . $search . '%');
        }
        $checklists = $query->paginate(12);
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
        $data = $request->all();
        $request->validated();
        $data['id'] = Checklist::exists() ? Checklist::latest()->first()->id + 1 : 1;
        Checklist::create($data);
        return redirect()->route('register-checklists.index')->with('success', 'Checklist cadastrado com sucesso');
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
        $data = $request->all();
        $request->validated();
        $checklist->update($data);
        return redirect()->route('register-checklists.index')->with('success', 'Checklist editado com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Checklist $checklist): RedirectResponse
    {
        $checklist->delete();
        return redirect()->route('register-checklists.index')->with('success', 'Checklist excluido com sucesso!');
    }
}
