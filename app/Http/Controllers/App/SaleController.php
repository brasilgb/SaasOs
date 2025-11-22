<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Part;
use App\Models\App\Sale;
use App\Models\App\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleController extends Controller
{

    public function index(Request $request)
    {
        $search = $request->get('q');
        $query = Sale::with('customer')->with('items')->orderBy('id', 'DESC');
        
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('sales_number', 'like', '%' . $search . '%')
                    ->orWhereHas('customer', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', '%' . $search . '%');
                    });
            });
        }
        $sales = $query->paginate(10)->withQueryString();
        return Inertia::render('app/sales/index', ['sales' => $sales, 'search' => $search]);
    }

    public function store(Request $request)
    {

        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'total_amount' => 'required|numeric',
            'parts' => 'required|array',
            'parts.*.part_id' => 'required|exists:parts,id',
            'parts.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $sale = Sale::create([
                'sales_number' => Sale::exists() ? Sale::latest()->first()->sales_number + 1 : 1,
                'customer_id' => $request->customer_id,
                'total_amount' => $request->total_amount,
            ]);

            foreach ($request->parts as $partData) {
                $part = Part::find($partData['part_id']);

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'part_id' => $partData['part_id'],
                    'quantity' => $partData['quantity'],
                    'unit_price' => $part->sale_price, // Get price from DB
                ]);

                // Adjust stock
                $part->quantity -= $partData['quantity'];
                $part->save();
            }

            DB::commit();

            return redirect()->route('app.dashboard')->with('success', 'Venda realizada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erro ao realizar a venda: ' . $e->getMessage());
        }
    }

    public function destroy(Sale $sale)
    {
        try {
            DB::beginTransaction();

            // Itera sobre os itens da venda para retornar as peças ao estoque
            foreach ($sale->items as $item) {
                $part = Part::find($item->part_id);
                if ($part) {
                    // Incrementa a quantidade da peça de volta ao estoque
                    $part->increment('quantity', $item->quantity);
                }
            }

            // Exclui a venda (os itens da venda serão excluídos em cascata se configurado no banco de dados)
            $sale->delete();

            DB::commit();

            return redirect()->route('app.sales.index')->with('success', 'Venda excluída e estoque estornado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erro ao excluir a venda: ' . $e->getMessage());
        }
    }
}
