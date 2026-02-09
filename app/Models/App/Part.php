<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Tenantable;
use Illuminate\Database\Eloquent\Model;

class Part extends Model
{
    use Tenantable, HasFactory;

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
