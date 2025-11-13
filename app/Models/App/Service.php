<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Tenantable;

class Service extends Model
{
    use Tenantable;
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function bugets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }
}
