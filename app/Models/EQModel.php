<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EQModel extends Model
{
    protected $table = 'eqmodels';

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function bugets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }

}
