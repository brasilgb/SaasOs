<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Tenantable;

class Budget extends Model
{
    use Tenantable;
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
