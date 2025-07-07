<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Tenantable;

class Brand extends Model
{
    use Tenantable;
    public function eqmodels(): HasMany
    {
        return $this->hasMany(EQModel::class);
    }

    public function bugets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }
}
