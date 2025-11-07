<?php

namespace App\Models\Admin;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{


    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class, 'plan');
    }
}