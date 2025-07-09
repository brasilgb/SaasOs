<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Model;
use App\Tenantable;

class WhatsappMessage extends Model
{
    use Tenantable;
    protected $guarded = [ 'id' ];
}
