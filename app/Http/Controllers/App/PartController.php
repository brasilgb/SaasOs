<?php

namespace App\Http\Controllers\App;

use App\Models\App\Part;
use App\Http\Controllers\Controller;
use App\Http\Requests\PartRequest;
use App\Models\App\PartMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class PartController extends Controller
{

    public function getPartsForPartNumber(Request $request)
    {
        $parts = Part::where('part_number', $request->part_number)->first();
        return response()->json([
            "success" => true,
            "parts" => $parts
        ]);
    }


    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');
        $query = Part::orderBy('id', 'DESC');
        if ($search) {
            $query->where('name', 'like', '%' . $search . '%')
                ->orWhere('part_number', 'like', '%' . $search . '%');
        }
        $parts = $query->paginate(12);
        return Inertia::render('app/parts/index', ['parts' => $parts]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('app/parts/create-part');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PartRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $part = Part::firstOrCreate(
            [
                'part_number' => $data['part_number'],
            ],
            [
                'name' => $data['name'],
                'description' => $data['description'],
                'manufacturer' => $data['manufacturer'],
                'model_compatibility' => $data['model_compatibility'],
                'cost_price' => str_replace(',', '.', $data['cost_price']),
                'sale_price' => str_replace(',', '.', $data['sale_price']),
                'quantity' => 0, // Começa com 0, será incrementado abaixo
                'minimum_stock_level' => $data['minimum_stock_level'],
                'location' => $data['location'],
                'is_active' => $data['is_active'],
            ]
        );
        // O `update` com `increment` é seguro em concorrência
        $part->increment('quantity', $data['quantity']);

        Part::create($data);
        return redirect()->route('app.parts.index')->with('success', 'Peça cadastrada com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Part $part)
    {
        return Inertia::render('app/parts/edit-part', ['parts' => $part]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Part $part)
    {
        return Redirect::route('app.parts.show', ['part' => $part->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PartRequest $request, Part $part): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $part->update($data);
        return redirect()->route('app.parts.show', ['part' => $part->id])->with('success', 'Peça alterada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Part $part)
    {
        $part->delete();
        return redirect()->route('app.parts.index')->with('success', 'Peça excluida com sucesso!');
    }
}
