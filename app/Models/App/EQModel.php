<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Tenantable;

class EQModel extends Model
{
    use Tenantable;
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
