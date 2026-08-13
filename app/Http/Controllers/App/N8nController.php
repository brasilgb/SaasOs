<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class N8nController extends Controller
{
    /**
     * Recebe o resultado da classificação de IA do n8n para uma Ordem de Serviço
     * e atualiza o registro com a prioridade e categoria sugeridas.
     */
    public function classificar(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'priority' => 'required|string|max:20',
            'category' => 'required|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $order->update([
            'ai_suggested_priority' => $data['priority'],
            'ai_suggested_category' => $data['category'],
            'ai_classification_notes' => $data['notes'] ?? null,
            'ai_classified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'result' => $order->only([
                'id',
                'ai_suggested_priority',
                'ai_suggested_category',
                'ai_classification_notes',
                'ai_classified_at',
            ]),
        ]);
    }
}
