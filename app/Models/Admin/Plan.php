<?php

namespace App\Models\Admin;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Database\Factories\PlanFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'value',
        'description',
        'billing_months',
    ];

    public function isTrial(): bool
    {
        $text = mb_strtolower(trim(($this->slug ?? '').' '.($this->name ?? '')));

        return str_contains($text, 'trial');
    }

    public function isCourtesy(): bool
    {
        $text = mb_strtolower(trim(($this->slug ?? '').' '.($this->name ?? '')));

        return str_contains($text, 'cortesia') || str_contains($text, 'courtesy');
    }

    public function billingMonths(): int
    {
        $periodMonths = $this->preferredPeriodBillingMonths();
        if ($periodMonths > 0) {
            return $periodMonths;
        }

        if ((int) ($this->billing_months ?? 0) > 0) {
            return (int) $this->billing_months;
        }

        $text = mb_strtolower(trim(($this->slug ?? '').' '.($this->name ?? '')));
        if ($text === '') {
            return 0;
        }

        if (str_contains($text, 'anual') || str_contains($text, 'year')) {
            return 12;
        }
        if (str_contains($text, 'semestral') || str_contains($text, 'semiannual')) {
            return 6;
        }
        if (str_contains($text, 'trimestral') || str_contains($text, 'quarter')) {
            return 3;
        }
        if (str_contains($text, 'mensal') || str_contains($text, 'month')) {
            return 1;
        }

        if (preg_match('/(^|[^0-9])(12|6|3|1)($|[^0-9])/', $text, $matches) === 1) {
            return (int) $matches[2];
        }

        return 0;
    }

    public function periods(): HasMany
    {
        return $this->hasMany(Period::class);
    }

    public function preferredPeriodBillingMonths(): int
    {
        $periods = $this->relationLoaded('periods')
            ? $this->periods
            : $this->periods()->get();

        if ($periods->isEmpty()) {
            return 0;
        }

        $preferred = $periods->first(function (Period $period) {
            return $this->periodMonths($period) === (int) ($this->billing_months ?? 0);
        }) ?? $periods->sortBy('id')->first();

        return $preferred ? $this->periodMonths($preferred) : 0;
    }

    private function periodMonths(Period $period): int
    {
        $interval = mb_strtolower((string) $period->interval);
        $count = (int) $period->interval_count;

        if ($count <= 0) {
            return 0;
        }

        return match ($interval) {
            'month', 'months', 'mensal', 'mes' => $count,
            'year', 'years', 'anual', 'ano' => $count * 12,
            default => 0,
        };
    }

    protected static function newFactory(): Factory
    {
        return PlanFactory::new();
    }

    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class, 'plan');
    }
}
