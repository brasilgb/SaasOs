<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Tenantable;
use Illuminate\Database\Eloquent\Model;

class Part extends Model
{
    use Tenantable;

    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_parts')
                    ->using(OrderPart::class)
                    ->withPivot('quantity');
    }
    
}
