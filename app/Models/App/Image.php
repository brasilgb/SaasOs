<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Tenantable;

class Image extends Model
{
    use Tenantable;
    public function order(): BelongsTo
    {
        return $this->belongsTo(order::class);
        return $this->belongsTo(Order::class);
    }
}
