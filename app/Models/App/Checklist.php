<?php

namespace App\Models\App;

use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Checklist extends Model
{
    use HasFactory, Tenantable;

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }
}
