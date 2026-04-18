<?php

namespace App\Models\Admin;

use App\Models\Tenant;
use Database\Factories\PlanFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function billingMonths(): int
    {
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

    protected static function newFactory(): Factory
    {
        return PlanFactory::new();
    }

    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class, 'plan');
    }
}
