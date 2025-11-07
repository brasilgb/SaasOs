<?php

namespace App\Models;

use App\Models\Admin\Branch;
use App\Models\Admin\Plan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Tenant extends Model
{

    protected $guarded = ['_method'];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan');
    }
    
    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }
    
    public function user(): HasOne
    {
        return $this->hasOne(User::class)->whereNull('roles');
    }
    
}
