<?php
// app/Services/InventoryService.php

namespace App\Services;

use App\Models\App\Part;
use App\Models\App\PartMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InventoryService
{
    public function removePartsFromStock(array $partsData, $orderId)
    {
        DB::beginTransaction();
        try {
            // dd($partsData);
            foreach ($partsData as $partItem) {
                $part = Part::find($partItem['id']);

                if (!$part || $part->quantity < $partItem['quantity']) {
                    throw new \Exception("Estoque insuficiente para a peça: " . $part->name);
                }

                // 1. Decrementa a quantidade na tabela `parts`
                $part->decrement('quantity', $partItem['quantity']);

                // 2. Registra o movimento de saída na tabela `part_movements`
                PartMovement::create([
                    'tenant_id' => Auth::user()->tenant_id,
                    'part_id' => $part->id,
                    'movement_type' => 'saida',
                    'quantity' => $partItem['quantity'],
                    'reason' => 'Ordem de Serviço #' . $orderId,
                    'order_id' => $orderId,
                    'user_id' => Auth::id(),
                ]);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }
}