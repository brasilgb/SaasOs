<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
    
    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }
}
