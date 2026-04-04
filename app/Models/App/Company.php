<?php

namespace App\Models\App;

use App\Tenantable;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use Tenantable;

    protected $guarded = ['_method', 'id'];
}
