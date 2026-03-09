<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Model;
use App\Tenantable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use Tenantable;

    protected $guarded = [ '_method', 'id' ];

}
