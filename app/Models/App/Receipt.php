<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Model;
use App\Tenantable;
    
class Receipt extends Model
{
    use Tenantable;
    protected $guarded = [ 'id' ];
}
