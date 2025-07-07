<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Tenantable;
    
class Receipt extends Model
{
    use Tenantable;
    protected $guarded = [ 'id' ];
}
