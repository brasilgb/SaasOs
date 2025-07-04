<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

        public function bugets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }
}
