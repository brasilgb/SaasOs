<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Tenantable;

class Equipment extends Model
{
    use Tenantable;
    public function checklists(): HasMany
    {
        return $this->hasMany(Checklist::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

  public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

}
