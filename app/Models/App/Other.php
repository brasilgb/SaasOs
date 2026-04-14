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
    ];

    public static function warrantyReturnAlertThreshold(): float
    {
        $configured = static::query()->value('warranty_return_alert_threshold');

        if ($configured !== null) {
            return (float) $configured;
        }

        return (float) config('business-metrics.warranty_return_alert_threshold', 10);
    }
}
