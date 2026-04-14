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

    public function updateBudgetStatus(Request $request, string $token)
    {
        $order = Order::where('tracking_token', $token)->firstOrFail();

        $validated = $request->validate([
            'status' => ['required', 'in:4,5'], // 4 aprovado, 5 recusado
        ]);

        if ((int) $order->service_status !== 3) {
            return back()->withErrors([
                'status' => 'Este orçamento não está mais disponível para aprovação ou reprovação.',
            ]);
        }

        $order->update([
            'service_status' => $validated['status'],
        ]);

        return back()->with('success', 'Status do orçamento atualizado com sucesso.');
    }
}
