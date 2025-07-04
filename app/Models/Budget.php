<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Budget extends Model
{
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }
    
    public function eqmodel(): BelongsTo
    {
        return $this->belongsTo(EQModel::class);
    }
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

}
