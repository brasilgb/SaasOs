<?php

namespace App\Providers;

use App\Events\CashSessionClosed;
use App\Events\CashSessionOpened;
use App\Events\ExpenseCreated;
use App\Events\ExpenseDeleted;
use App\Events\ExpenseUpdated;
use App\Events\MessageCreated;
use App\Events\MessageDeleted;
use App\Events\MessageReadStatusUpdated;
use App\Events\MessageUpdated;
use App\Events\OrderBudgetFollowUpRequested;
use App\Events\OrderCreated;
use App\Events\OrderCustomerFeedbackSubmitted;
use App\Events\OrderCustomerNotificationAcknowledged;
use App\Events\OrderCustomerPickupAcknowledged;
use App\Events\OrderFeedbackRecoveryUpdated;
use App\Events\OrderLifecycleCreated;
use App\Events\OrderLifecycleStatusChanged;
use App\Events\OrderPaymentRegistered;
use App\Events\OrderPaymentRemoved;
use App\Events\OrderPaymentReminderRequested;
use App\Events\OrderStatusUpdated;
use App\Events\SaleCancelled;
use App\Events\SaleCreated;
use App\Events\SaleDeleted;
use App\Events\WhatsappMessageSettingsUpdated;
use App\Listeners\RecordCashSessionClosedLifecycle;
use App\Listeners\RecordCashSessionOpenedLifecycle;
use App\Listeners\RecordExpenseCreatedLifecycle;
use App\Listeners\RecordExpenseDeletedLifecycle;
use App\Listeners\RecordExpenseUpdatedLifecycle;
use App\Listeners\RecordMessageCreatedAudit;
use App\Listeners\RecordMessageDeletedAudit;
use App\Listeners\RecordMessageReadStatusUpdatedAudit;
use App\Listeners\RecordMessageUpdatedAudit;
use App\Listeners\RecordOrderCustomerFeedbackSubmittedLifecycle;
use App\Listeners\RecordOrderCustomerNotificationAcknowledgedLifecycle;
use App\Listeners\RecordOrderCustomerPickupAcknowledgedLifecycle;
use App\Listeners\RecordOrderCreatedLifecycle;
use App\Listeners\RecordOrderFeedbackRecoveryUpdatedLifecycle;
use App\Listeners\RecordOrderPaymentRegisteredLifecycle;
use App\Listeners\RecordOrderPaymentRemovedLifecycle;
use App\Listeners\RecordOrderStatusChangedLifecycle;
use App\Listeners\RecordSaleCancelledLifecycle;
use App\Listeners\RecordSaleCreatedLifecycle;
use App\Listeners\RecordSaleDeletedLifecycle;
use App\Listeners\RecordWhatsappMessageSettingsUpdatedAudit;
use App\Listeners\SendOrderBudgetFollowUpNotification;
use App\Listeners\SendOrderCreatedNotification;
use App\Listeners\SendOrderPaymentReminderNotification;
use App\Listeners\SendOrderStatusUpdatedNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        OrderCreated::class => [
            SendOrderCreatedNotification::class,
        ],
        OrderLifecycleCreated::class => [
            RecordOrderCreatedLifecycle::class,
        ],
        OrderStatusUpdated::class => [
            SendOrderStatusUpdatedNotification::class,
        ],
        OrderLifecycleStatusChanged::class => [
            RecordOrderStatusChangedLifecycle::class,
        ],
        OrderPaymentRegistered::class => [
            RecordOrderPaymentRegisteredLifecycle::class,
        ],
        OrderPaymentRemoved::class => [
            RecordOrderPaymentRemovedLifecycle::class,
        ],
        OrderPaymentReminderRequested::class => [
            SendOrderPaymentReminderNotification::class,
        ],
        OrderBudgetFollowUpRequested::class => [
            SendOrderBudgetFollowUpNotification::class,
        ],
        SaleCreated::class => [
            RecordSaleCreatedLifecycle::class,
        ],
        SaleCancelled::class => [
            RecordSaleCancelledLifecycle::class,
        ],
        SaleDeleted::class => [
            RecordSaleDeletedLifecycle::class,
        ],
        CashSessionOpened::class => [
            RecordCashSessionOpenedLifecycle::class,
        ],
        CashSessionClosed::class => [
            RecordCashSessionClosedLifecycle::class,
        ],
        ExpenseCreated::class => [
            RecordExpenseCreatedLifecycle::class,
        ],
        ExpenseUpdated::class => [
            RecordExpenseUpdatedLifecycle::class,
        ],
        ExpenseDeleted::class => [
            RecordExpenseDeletedLifecycle::class,
        ],
        MessageCreated::class => [
            RecordMessageCreatedAudit::class,
        ],
        MessageUpdated::class => [
            RecordMessageUpdatedAudit::class,
        ],
        MessageReadStatusUpdated::class => [
            RecordMessageReadStatusUpdatedAudit::class,
        ],
        MessageDeleted::class => [
            RecordMessageDeletedAudit::class,
        ],
        WhatsappMessageSettingsUpdated::class => [
            RecordWhatsappMessageSettingsUpdatedAudit::class,
        ],
        OrderCustomerNotificationAcknowledged::class => [
            RecordOrderCustomerNotificationAcknowledgedLifecycle::class,
        ],
        OrderCustomerPickupAcknowledged::class => [
            RecordOrderCustomerPickupAcknowledgedLifecycle::class,
        ],
        OrderCustomerFeedbackSubmitted::class => [
            RecordOrderCustomerFeedbackSubmittedLifecycle::class,
        ],
        OrderFeedbackRecoveryUpdated::class => [
            RecordOrderFeedbackRecoveryUpdatedLifecycle::class,
        ],
    ];

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
