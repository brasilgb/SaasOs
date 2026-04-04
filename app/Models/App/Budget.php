<?php

namespace App\Models\App;

use App\Tenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Budget extends Model
{
    use Tenantable;

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }
}
