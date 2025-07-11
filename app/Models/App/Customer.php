<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Tenantable;

class Customer extends Model
{
    use Tenantable;
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
