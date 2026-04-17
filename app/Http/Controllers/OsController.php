<?php

namespace App\Http\Controllers;

use App\Events\OrderCustomerFeedbackSubmitted;
use App\Events\OrderCustomerNotificationAcknowledged;
use App\Events\OrderCustomerPickupAcknowledged;
use App\Models\App\Checklist;
use App\Models\App\Company;
use App\Models\App\Order;
use App\Models\App\OrderPayment;
use App\Models\App\Receipt;
use App\Services\OrderStatusService;
use App\Support\OrderStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OsController extends Controller
{
    public function __construct(private readonly OrderStatusService $orderStatusService) {}

    private function publicOrderQuery()
    {
        return Order::withoutGlobalScopes();
    }

    private function publicOrderByToken(string $token)
    {
        return $this->publicOrderQuery()
            ->where('tracking_token', $token);
    }

    public function index($token)
    {
        $order = $this->publicOrderByToken($token)
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

    private function tenantScopedFirst(string $modelClass, int $tenantId)
    {
        return $modelClass::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->first();
    }

    private function remainingAmount(Order $order): float
    {
        $totalPaid = OrderPayment::withoutGlobalScopes()
            ->where('order_id', $order->id)
            ->where('tenant_id', $order->tenant_id)
            ->sum('amount');

        return max(0, (float) ($order->service_cost ?? 0) - (float) $totalPaid);
    }

    public function updateBudgetStatus(Request $request, string $token)
    {
        $order = $this->publicOrderByToken($token)->firstOrFail();

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

        try {
            $this->orderStatusService->transition($order, (int) $validated['status'], null);
        } catch (\Illuminate\Validation\ValidationException) {
            return back()->withErrors([
                'status' => 'Transição de status não permitida para este orçamento.',
            ]);
        }

        return back()->with('success', 'Status do orçamento atualizado com sucesso.');
    }

    public function acknowledgeNotification(string $token)
    {
        $order = $this->publicOrderByToken($token)->firstOrFail();

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

        $shouldTransitionToCustomerNotified = (int) $order->service_status === OrderStatus::SERVICE_COMPLETED;

        $order->update($updates);

        if ($shouldTransitionToCustomerNotified) {
            $order = $this->orderStatusService->transition(
                $order,
                OrderStatus::CUSTOMER_NOTIFIED,
                null,
                'Cliente confirmou que recebeu o aviso de conclusão.'
            );
        }

        event(new OrderCustomerNotificationAcknowledged($order->id, [
            'acknowledged_at' => now()->toIso8601String(),
            'status_after' => (int) ($updates['service_status'] ?? $order->service_status),
        ]));

        return back()->with('success', 'Confirmação de aviso registrada com sucesso.');
    }

    public function acknowledgePickup(string $token)
    {
        $order = $this->publicOrderByToken($token)->firstOrFail();

        if (! in_array((int) $order->service_status, [OrderStatus::CUSTOMER_NOTIFIED, OrderStatus::DELIVERED], true)) {
            return back()->withErrors([
                'pickup' => 'Esta ordem ainda não está elegível para confirmação de retirada.',
            ]);
        }

        if ($this->remainingAmount($order) > 0.009) {
            return back()->withErrors([
                'pickup' => 'Ainda existe saldo pendente para esta ordem. Regularize o pagamento antes de confirmar a retirada.',
            ]);
        }

        if ($order->customer_pickup_acknowledged_at) {
            return back()->with('success', 'Confirmação de retirada já registrada anteriormente.');
        }

        $now = now();
        $updates = [
            'customer_pickup_acknowledged_at' => $now,
        ];

        $shouldTransitionToDelivered = (int) $order->service_status === OrderStatus::CUSTOMER_NOTIFIED;

        if (! $order->delivery_date) {
            $updates['delivery_date'] = $now;
        }

        $order->update($updates);

        if ($shouldTransitionToDelivered) {
            $order = $this->orderStatusService->transition(
                $order,
                OrderStatus::DELIVERED,
                null,
                'Cliente confirmou a retirada do equipamento pela área pública.'
            );
        }

        event(new OrderCustomerPickupAcknowledged($order->id, [
            'acknowledged_at' => $now->toIso8601String(),
            'status_after' => (int) ($updates['service_status'] ?? $order->service_status),
        ]));

        return back()->with('success', 'Confirmação de retirada registrada com sucesso.');
    }

    public function receipt(string $token, string $type)
    {
        $allowedTypes = ['orentrega', 'ororcamento'];
        abort_unless(in_array($type, $allowedTypes, true), 404);

        $order = $this->publicOrderByToken($token)
            ->with(['customer', 'equipment', 'orderParts'])
            ->firstOrFail();

        if ($type === 'orentrega' && ! in_array((int) $order->service_status, [OrderStatus::SERVICE_COMPLETED, OrderStatus::CUSTOMER_NOTIFIED, OrderStatus::DELIVERED], true)) {
            abort(403);
        }

        if ($type === 'ororcamento' && ! ($order->budget_description || (float) ($order->budget_value ?? 0) > 0)) {
            abort(404);
        }

        $company = $this->tenantScopedFirst(Company::class, (int) $order->tenant_id);
        $receipt = Receipt::withoutGlobalScopes()
            ->where('tenant_id', $order->tenant_id)
            ->latest('id')
            ->first();
        $checklist = Checklist::withoutGlobalScopes()
            ->where('tenant_id', $order->tenant_id)
            ->where('equipment_id', $order->equipment_id)
            ->first('checklist');

        return Inertia::render('app/receipts/print-receipt', [
            'order' => $order,
            'type' => $type,
            'company' => $company,
            'receipt' => $receipt,
            'checklist' => $checklist,
            'backUrl' => route('os.token', $order->tracking_token),
        ]);
    }

    public function paymentProof(string $token)
    {
        $order = $this->publicOrderByToken($token)
            ->with(['customer', 'equipment', 'orderPayments'])
            ->firstOrFail();

        abort_if($order->orderPayments->isEmpty(), 404);

        $company = $this->tenantScopedFirst(Company::class, (int) $order->tenant_id);

        return Inertia::render('app/serviceorders/payment-proof', [
            'order' => $order,
            'company' => $company,
            'backUrl' => route('os.token', $order->tracking_token),
        ]);
    }

    public function fiscalProof(string $token)
    {
        $order = $this->publicOrderByToken($token)
            ->with(['customer', 'equipment'])
            ->firstOrFail();

        abort_unless($order->fiscal_document_number || $order->fiscal_document_url, 404);

        $company = $this->tenantScopedFirst(Company::class, (int) $order->tenant_id);

        return Inertia::render('app/serviceorders/fiscal-proof', [
            'order' => $order,
            'company' => $company,
            'backUrl' => route('os.token', $order->tracking_token),
        ]);
    }

    public function submitFeedback(Request $request, string $token)
    {
        $order = $this->publicOrderByToken($token)->firstOrFail();

        if ((int) $order->service_status !== OrderStatus::DELIVERED) {
            return back()->withErrors([
                'feedback' => 'O feedback só pode ser enviado após a entrega do equipamento.',
            ]);
        }

        if ($order->customer_feedback_submitted_at) {
            return back()->with('success', 'Seu feedback já foi registrado anteriormente.');
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $now = now();

        $order->update([
            'feedback' => 1,
            'customer_feedback_rating' => (int) $validated['rating'],
            'customer_feedback_comment' => $validated['comment'] ?? null,
            'customer_feedback_submitted_at' => $now,
            'customer_feedback_recovery_status' => (int) $validated['rating'] <= 3 ? 'pending' : null,
            'customer_feedback_recovery_updated_at' => (int) $validated['rating'] <= 3 ? $now : null,
        ]);

        event(new OrderCustomerFeedbackSubmitted($order->id, [
            'rating' => (int) $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'submitted_at' => $now->toIso8601String(),
        ]));

        return back()->with('success', 'Obrigado! Seu feedback foi enviado com sucesso.');
    }
}
