<?php

namespace App\Services;

use App\Jobs\SendOrderBudgetFollowUpNotification;
use App\Jobs\SendOrderCreatedNotification;
use App\Jobs\SendOrderPaymentReminderNotification;
use App\Jobs\SendOrderStatusUpdatedNotification;
use App\Mail\OrderBudgetFollowUpMail;
use App\Mail\OrderCreatedMail;
use App\Mail\OrderPaymentReminderMail;
use App\Mail\OrderStatusUpdatedMail;
use App\Models\App\Order;
use App\Support\TenantMailConfig;
use Illuminate\Support\Facades\Mail;

class OrderNotificationService
{
    private function resolveOrder(int $orderId): ?Order
    {
        return Order::query()
            ->with(['customer', 'tenant'])
            ->find($orderId);
    }

    public function canSendToCustomer(Order $order, ?string $customerEmail): bool
    {
        $email = trim((string) ($customerEmail ?? ''));

        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        return TenantMailConfig::hasConfiguredForTenantId($order->tenant_id ? (int) $order->tenant_id : null);
    }

    public function sendCreated(Order $order): void
    {
        if (! $this->canSendToCustomer($order->loadMissing(['customer', 'tenant']), $order->customer?->email)) {
            return;
        }

        SendOrderCreatedNotification::dispatch($order->id)->afterCommit();
    }

    public function sendStatusUpdated(Order $order, string $statusLabel, ?string $observations = null): void
    {
        if (! $this->canSendToCustomer($order->loadMissing(['customer', 'tenant']), $order->customer?->email)) {
            return;
        }

        SendOrderStatusUpdatedNotification::dispatch($order->id, $statusLabel, $observations)->afterCommit();
    }

    public function sendPaymentReminder(Order $order, array $paymentSummary, bool $isOverdue): void
    {
        if (! $this->canSendToCustomer($order->loadMissing(['customer', 'tenant']), $order->customer?->email)) {
            return;
        }

        SendOrderPaymentReminderNotification::dispatch($order->id, $paymentSummary, $isOverdue)->afterCommit();
    }

    public function sendBudgetFollowUp(Order $order, int $daysPending): void
    {
        if (! $this->canSendToCustomer($order->loadMissing(['customer', 'tenant']), $order->customer?->email)) {
            return;
        }

        SendOrderBudgetFollowUpNotification::dispatch($order->id, $daysPending)->afterCommit();
    }

    public function deliverCreated(int $orderId): void
    {
        $order = $this->resolveOrder($orderId);

        if (! $order) {
            return;
        }

        $customerEmail = trim((string) ($order->customer?->email ?? ''));

        if (! $this->canSendToCustomer($order, $customerEmail)) {
            return;
        }

        TenantMailConfig::applyForTenantId($order->tenant_id ? (int) $order->tenant_id : null);
        Mail::to($customerEmail)->send(new OrderCreatedMail($order));
    }

    public function deliverStatusUpdated(int $orderId, string $statusLabel, ?string $observations = null): void
    {
        $order = $this->resolveOrder($orderId);

        if (! $order) {
            return;
        }

        $customerEmail = trim((string) ($order->customer?->email ?? ''));

        if (! $this->canSendToCustomer($order, $customerEmail)) {
            return;
        }

        TenantMailConfig::applyForTenantId($order->tenant_id ? (int) $order->tenant_id : null);
        Mail::to($customerEmail)->send(new OrderStatusUpdatedMail($order, $statusLabel, $observations));
    }

    public function deliverPaymentReminder(int $orderId, array $paymentSummary, bool $isOverdue): void
    {
        $order = $this->resolveOrder($orderId);

        if (! $order) {
            return;
        }

        $customerEmail = trim((string) ($order->customer?->email ?? ''));

        if (! $this->canSendToCustomer($order, $customerEmail)) {
            return;
        }

        TenantMailConfig::applyForTenantId($order->tenant_id ? (int) $order->tenant_id : null);
        Mail::to($customerEmail)->send(new OrderPaymentReminderMail($order, $paymentSummary, $isOverdue));
    }

    public function deliverBudgetFollowUp(int $orderId, int $daysPending): void
    {
        $order = $this->resolveOrder($orderId);

        if (! $order) {
            return;
        }

        $customerEmail = trim((string) ($order->customer?->email ?? ''));

        if (! $this->canSendToCustomer($order, $customerEmail)) {
            return;
        }

        TenantMailConfig::applyForTenantId($order->tenant_id ? (int) $order->tenant_id : null);
        Mail::to($customerEmail)->send(new OrderBudgetFollowUpMail($order, $daysPending));
    }
}
