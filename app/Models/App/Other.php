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
        'warranty_return_alert_threshold' => 'float',
        'communication_follow_up_cooldown_days' => 'integer',
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
