<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderPart extends Model
{
    
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
