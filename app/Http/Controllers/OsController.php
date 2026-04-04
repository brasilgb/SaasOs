<?php

namespace App\Http\Controllers;

use App\Models\App\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OsController extends Controller
{
    public function index($token)
    {
        $order = Order::where('tracking_token', $token)->with('equipment')->with('customer')->firstOrFail();

        return Inertia::render('app/serviceorders/index', ['order' => $order]);
    }

    public function updateBudgetStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:4,9'], // 4 aprovado, 9 recusado
        ]);

        // // Regra de negócio (opcional, mas recomendado)
        // if ($order->service_status != 2) {
        //     return back()->withErrors('Orçamento não está em estado válido para alteração.');
        // }

        $order->update([
            'service_status' => $validated['status'],
        ]);

        return back()->with('success', 'Status do orçamento atualizado com sucesso.');
    }
}
