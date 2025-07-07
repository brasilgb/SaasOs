<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Tenantable;

class Checklist extends Model
{
    use Tenantable;
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }
}
