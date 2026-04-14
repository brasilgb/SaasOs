<?php

namespace App\Http\Controllers;

use App\Models\App\Order;
use App\Models\App\OrderStatusHistory;
use App\Support\OrderStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OsController extends Controller
{
    public function index($token)
    {
        $order = Order::where('tracking_token', $token)
            ->with('equipment')
            ->with('customer')
            ->with('statusHistory')
            ->with('logs')
            ->firstOrFail();

        return Inertia::render('app/serviceorders/index', ['order' => $order]);
    }

    public function updateBudgetStatus(Request $request, string $token)
    {
        $order = Order::where('tracking_token', $token)->firstOrFail();

        $validated = $request->validate([
            'status' => ['required', 'integer'],
        ]);

        if ((int) $validated['status'] !== OrderStatus::BUDGET_APPROVED && (int) $validated['status'] !== OrderStatus::BUDGET_REJECTED) {
            return back()->withErrors([
                'status' => 'Status inválido para resposta do orçamento.',
            ]);
        }

        if ((int) $order->service_status !== OrderStatus::BUDGET_GENERATED) {
            return back()->withErrors([
                'status' => 'Este orçamento não está mais disponível para aprovação ou reprovação.',
            ]);
        }

        if (! OrderStatus::canTransition($order->service_status, $validated['status'])) {
            return back()->withErrors([
                'status' => 'Transição de status não permitida para este orçamento.',
            ]);
        }

        $order->update([
            'service_status' => $validated['status'],
        ]);

        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => (int) $validated['status'],
            'changed_by' => null,
            'note' => OrderStatus::label((int) $validated['status']),
        ]);

        return back()->with('success', 'Status do orçamento atualizado com sucesso.');
    }
}
