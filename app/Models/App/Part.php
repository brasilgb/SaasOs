<?php

namespace App\Models\App;

use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Part extends Model
{
    use HasFactory, Tenantable;

    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_parts')
            ->using(OrderPart::class)
            ->withPivot('quantity');
    }

    public function part_movements()
    {
        return $this->hasMany(PartMovement::class, 'part_id');
    }
}
