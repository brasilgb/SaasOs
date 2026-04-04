<?php

namespace App\Models\App;

use App\Tenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Image extends Model
{
    use Tenantable;

    public function order(): BelongsTo
    {
        return $this->belongsTo(order::class);
    }
}
