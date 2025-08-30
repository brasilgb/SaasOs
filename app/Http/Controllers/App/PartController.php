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

        public function registerPartEntry(array $data)
    {
        DB::beginTransaction();

        try {
            // 1. Tentar encontrar a peça pelo número, ou criar se não existir
            $part = Part::firstOrCreate(
                [
                    'tenant_id' => Auth::user()->tenant_id,
                    'part_number' => $data['part_number'],
                ],
                [
                    'name' => $data['name'],
                    'cost_price' => $data['cost_price'],
                    'sale_price' => $data['sale_price'],
                    'stock_quantity' => 0, // Começa com 0, será incrementado abaixo
                ]
            );

            // 2. Incrementar a quantidade em estoque na tabela 'parts'
            // O `update` com `increment` é seguro em concorrência
            $part->increment('stock_quantity', $data['quantity']);

            // 3. Registrar o movimento de entrada
            PartMovement::create([
                'tenant_id' => Auth::user()->tenant_id,
                'part_id' => $part->id,
                'movement_type' => 'entrada',
                'quantity' => $data['quantity'],
                'reason' => 'Compra de Fornecedor',
                'user_id' => Auth::id(),
            ]);

            DB::commit();

            return ['success' => true, 'message' => 'Entrada de peças registrada com sucesso.'];
        } catch (\Exception $e) {
            DB::rollback();

            return ['success' => false, 'message' => 'Erro ao registrar a entrada: ' . $e->getMessage()];
        }
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
                    'stock_quantity' => 0, // Começa com 0, será incrementado abaixo
                    'minimum_stock_level' => $data['minimum_stock_level'],
                    'location' => $data['location'],
                    'is_active' => $data['is_active'],
                ]
            );

            // 2. Incrementar a quantidade em estoque na tabela 'parts'
            // O `update` com `increment` é seguro em concorrência
            $part->increment('stock_quantity', $data['stock_quantity']);

            // 3. Registrar o movimento de entrada
            PartMovement::create([
                'part_id' => $part->id,
                'movement_type' => 'entrada',
                'quantity' => $data['stock_quantity'],
                'reason' => 'Compra de Fornecedor',
                'user_id' => Auth::id(),
            ]);
        // Part::create($data);
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
