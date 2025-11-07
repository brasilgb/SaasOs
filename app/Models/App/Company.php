<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Model;
use App\Tenantable;

class Company extends Model
{
    use Tenantable;

    protected $guarded = [ '_method', 'id' ];
}
