<?php

namespace App\Models;

use App\Models\Admin\Branch;
use App\Models\Admin\Plan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Tenant extends Model
{
    use HasFactory;

    protected $guarded = ['_method'];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class)->whereNull('roles');
    }

    public function getGraceDaysRemainingAttribute()
    {
        if (!$this->expires_at) {
            return 30; // Ou o padrão de dias do trial
        }

        $expiry = \Carbon\Carbon::parse($this->expires_at);
        $limitDate = $expiry->copy()->addDays(3);
        $now = now();

        // Se já passou até da carência, retorna 0
        if ($now->greaterThan($limitDate)) {
            return 0;
        }

        // Retorna a diferença em dias
        return (int) $now->diffInDays($limitDate, false);
    }
}
