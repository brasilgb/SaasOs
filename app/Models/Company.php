<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Tenantable;

class Company extends Model
{
    use Tenantable;
    protected $guarded = [ 'id' ];
}
