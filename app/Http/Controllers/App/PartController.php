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
        $parts = Part::where('reference_number', $request->reference_number)->first();
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
                ->orWhere('reference_number', 'like', '%' . $search . '%');
        }
        $parts = $query->paginate(11);
        return Inertia::render('app/parts/index', ['parts' => $parts]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Part::distinct()->pluck('category');
        return Inertia::render('app/parts/create-part', ['categories' => $categories]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PartRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();

        DB::transaction(function () use ($data) {
            $part = Part::firstOrCreate(
                [
                    'reference_number' => $data['reference_number'],
                ],
                [
                    'part_number' => Part::exists() ? Part::latest()->first()->part_number + 1 : 1,
                    'category' => $data['category'],
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'manufacturer' => $data['manufacturer'],
                    'model_compatibility' => $data['model_compatibility'],
                    'cost_price' => $data['cost_price'],
                    'sale_price' => $data['sale_price'],
                    'quantity' => 0, // Começa com 0, será incrementado abaixo
                    'minimum_stock_level' => $data['minimum_stock_level'],
                    'location' => $data['location'],
                    'status' => $data['status'],
                ]
            );

            // O `update` com `increment` é seguro em concorrência
            $part->increment('quantity', $data['quantity']);

            // Registrar o movimento de entrada
            PartMovement::create([
                'part_id' => $part->id,
                'user_id' => Auth::id(),
                'movement_type' => 'entrada',
                'quantity' => $data['quantity'],
                'reason' => 'Cadastro inicial',
            ]);
        });

        return redirect()->route('app.parts.index')->with('success', 'Peça cadastrada com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Part $part)
    {
        $categories = Part::distinct()->pluck('category');
        return Inertia::render('app/parts/edit-part', ['parts' => $part, 'categories' => $categories]);
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

        DB::transaction(function () use ($part, $data) {
            $oldQuantity = $part->quantity;
            $part->update($data);
            $newQuantity = $part->quantity;

            $quantityDiff = $newQuantity - $oldQuantity;

            if ($quantityDiff != 0) {
                PartMovement::create([
                    'part_id' => $part->id,
                    'user_id' => Auth::id(),
                    'movement_type' => $quantityDiff > 0 ? 'entrada' : 'saida',
                    'quantity' => abs($quantityDiff),
                    'reason' => 'Ajuste de estoque',
                ]);
            }
        });

        return redirect()->route('app.parts.show', ['part' => $part->id])->with('success', 'Peça alterada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Part $part)
    {
        DB::transaction(function () use ($part) {
            PartMovement::create([
                'part_id' => $part->id,
                'user_id' => Auth::id(),
                'movement_type' => 'saida',
                'quantity' => $part->quantity,
                'reason' => 'Exclusão de peça',
            ]);

            $part->delete();
        });

        return redirect()->route('app.parts.index')->with('success', 'Peça excluida com sucesso!');
    }
}
