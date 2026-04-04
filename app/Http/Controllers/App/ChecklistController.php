<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChecklistRequest;
use App\Models\App\Checklist;
use App\Models\App\Equipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChecklistController extends Controller
{
    private function authorizeChecklistAccess(): void
    {
        abort_unless(Auth::user()?->hasPermission('register_checklists'), 403);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorizeChecklistAccess();

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
        $this->authorizeChecklistAccess();

        $data = $request->all();
        $request->validated();
        $data['checklist_number'] = Checklist::exists() ? Checklist::latest()->first()->checklist_number + 1 : 1;
        Checklist::create($data);

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
        $this->authorizeChecklistAccess();

        $data = $request->all();
        $request->validated();
        $checklist->update($data);

        return redirect()->route('app.register-checklists.index')->with('success', 'Checklist editado com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Checklist $checklist): RedirectResponse
    {
        $this->authorizeChecklistAccess();

        $checklist->delete();

        return redirect()->route('app.register-checklists.index')->with('success', 'Checklist excluido com sucesso!');
    }
}
