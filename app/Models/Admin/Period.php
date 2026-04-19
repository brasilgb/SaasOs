<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Period extends Model
{
    use HasFactory;

    protected $fillable = [
        'plan_id',
        'name',
        'interval',
        'interval_count',
        'price',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function billingMonths(): int
    {
        $interval = mb_strtolower((string) $this->interval);
        $count = (int) $this->interval_count;

        if ($count <= 0) {
            return 0;
        }

        return match ($interval) {
            'month', 'months', 'mensal', 'mes' => $count,
            'year', 'years', 'anual', 'ano' => $count * 12,
            default => 0,
        };
    }

    public function features(): HasMany
    {
        return $this->hasMany(Feature::class);
    }
}
