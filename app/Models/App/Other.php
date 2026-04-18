<?php

namespace App\Models\App;

use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Other extends Model
{
    use HasFactory, Tenantable;

    protected $casts = [
        'navigation' => 'boolean',
        'enableparts' => 'boolean',
        'enablesales' => 'boolean',
        'show_follow_ups_menu' => 'boolean',
        'show_tasks_menu' => 'boolean',
        'show_commercial_performance_menu' => 'boolean',
        'show_quality_menu' => 'boolean',
        'print_label_button_after_order_create' => 'boolean',
        'warranty_return_alert_threshold' => 'float',
        'communication_follow_up_cooldown_days' => 'integer',
        'automatic_follow_ups_enabled' => 'boolean',
        'customer_feedback_request_delay_days' => 'integer',
        'budget_conversion_target' => 'float',
        'payment_recovery_target' => 'float',
    ];

    public static function warrantyReturnAlertThreshold(): float
    {
        $configured = static::query()->value('warranty_return_alert_threshold');

        if ($configured !== null) {
            return (float) $configured;
        }

        return (float) config('business-metrics.warranty_return_alert_threshold', 10);
    }

    public static function communicationFollowUpCooldownDays(?int $tenantId = null): int
    {
        $query = static::query();

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        $configured = $query->value('communication_follow_up_cooldown_days');

        if ($configured !== null) {
            return max(1, (int) $configured);
        }

        return 2;
    }

    public static function automaticFollowUpsEnabled(?int $tenantId = null): bool
    {
        $query = static::query();

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        $configured = $query->value('automatic_follow_ups_enabled');

        if ($configured !== null) {
            return (bool) $configured;
        }

        return false;
    }

    public static function budgetConversionTarget(?int $tenantId = null): float
    {
        $query = static::query();

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        $configured = $query->value('budget_conversion_target');

        if ($configured !== null) {
            return (float) $configured;
        }

        return 60.0;
    }

    public static function customerFeedbackRequestDelayDays(?int $tenantId = null): int
    {
        $query = static::query();

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        $configured = $query->value('customer_feedback_request_delay_days');

        if ($configured !== null) {
            return max(1, (int) $configured);
        }

        return 7;
    }

    public static function paymentRecoveryTarget(?int $tenantId = null): float
    {
        $query = static::query();

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        $configured = $query->value('payment_recovery_target');

        if ($configured !== null) {
            return (float) $configured;
        }

        return 70.0;
    }
}
