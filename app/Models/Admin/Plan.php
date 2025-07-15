<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{

    public function plans(): HasMany
    {
        return $this->hasMany(Plan::class);
    }
}
