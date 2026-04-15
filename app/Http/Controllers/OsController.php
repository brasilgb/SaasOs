<?php

namespace App\Http\Controllers;

use App\Models\App\Order;
use App\Models\App\OrderLog;
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
            ->with('images:id,order_id,filename')
            ->with('orderPayments:id,order_id,amount,paid_at,payment_method')
            ->with('warrantySourceOrder:id,order_number,warranty_expires_at')
            ->firstOrFail();

        return Inertia::render('app/serviceorders/index', ['order' => $order]);
    }

    private function logOrderAction(Order $order, string $action, array $data = []): void
    {
        OrderLog::create([
            'order_id' => $order->id,
            'user_id' => null,
            'action' => $action,
            'data' => $data === [] ? null : $data,
            'created_at' => now(),
        ]);
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

    public function acknowledgeNotification(string $token)
    {
        $order = Order::where('tracking_token', $token)->firstOrFail();

        if (! in_array((int) $order->service_status, [OrderStatus::SERVICE_COMPLETED, OrderStatus::CUSTOMER_NOTIFIED], true)) {
            return back()->withErrors([
                'notification' => 'Esta ordem ainda não está elegível para confirmação de aviso.',
            ]);
        }

        if ($order->customer_notification_acknowledged_at) {
            return back()->with('success', 'Confirmação de aviso já registrada anteriormente.');
        }

        $updates = [
            'customer_notification_acknowledged_at' => now(),
        ];

        if ((int) $order->service_status === OrderStatus::SERVICE_COMPLETED) {
            $updates['service_status'] = OrderStatus::CUSTOMER_NOTIFIED;
        }

        $order->update($updates);

        if (($updates['service_status'] ?? null) === OrderStatus::CUSTOMER_NOTIFIED) {
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => OrderStatus::CUSTOMER_NOTIFIED,
                'changed_by' => null,
                'note' => 'Cliente confirmou que recebeu o aviso de conclusão.',
            ]);
        }

        $this->logOrderAction($order, 'customer_notification_acknowledged', [
            'acknowledged_at' => now()->toIso8601String(),
            'status_after' => (int) ($updates['service_status'] ?? $order->service_status),
        ]);

        return back()->with('success', 'Confirmação de aviso registrada com sucesso.');
    }
}
