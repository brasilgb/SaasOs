<?php

namespace App\Services;

use App\Models\App\CashSession;
use App\Models\App\Order;
use App\Models\App\OrderPayment;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class OrderPaymentService
{
    public function register(Order $order, array $data): OrderPayment
    {
        $order->loadMissing('orderPayments');

        $amount = round((float) $data['amount'], 2);
        $remaining = $this->remainingAmount($order);

        if ($amount > $remaining) {
            throw ValidationException::withMessages([
                'amount' => 'O valor informado é maior que o saldo restante da ordem.',
            ]);
        }

        $openCashSessionId = CashSession::query()
            ->where('status', 'open')
            ->latest('opened_at')
            ->value('id');

        if (! $openCashSessionId) {
            throw ValidationException::withMessages([
                'amount' => 'Abra o caixa diário antes de registrar pagamento da ordem.',
            ]);
        }

        return OrderPayment::create([
            'order_id' => $order->id,
            'cash_session_id' => $openCashSessionId,
            'amount' => $amount,
            'payment_method' => $data['payment_method'],
            'paid_at' => $data['paid_at'] ?? now(),
            'notes' => $data['notes'] ?? null,
        ]);
    }

    public function remove(OrderPayment $payment): array
    {
        if ($payment->cashSession?->status === 'closed') {
            throw new RuntimeException('Não é possível remover pagamento vinculado a um caixa já fechado.');
        }

        $paymentData = [
            'payment_id' => $payment->id,
            'cash_session_id' => $payment->cash_session_id,
            'amount' => (float) $payment->amount,
            'payment_method' => $payment->payment_method,
            'paid_at' => $payment->paid_at?->toDateTimeString(),
        ];

        $payment->delete();

        return $paymentData;
    }

    private function remainingAmount(Order $order): float
    {
        $totalOrder = round((float) ($order->service_cost ?? 0), 2);
        $totalPaid = round((float) $order->orderPayments->sum('amount'), 2);

        return round(max(0, $totalOrder - $totalPaid), 2);
    }
}
