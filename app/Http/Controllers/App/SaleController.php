<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Part;
use App\Models\App\Sale;
use App\Models\App\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
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
}