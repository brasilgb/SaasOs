<?php

namespace App\Models\App;

use App\Tenantable;
use Illuminate\Database\Eloquent\Model;

class WhatsappMessage extends Model
{
    use Tenantable;

    protected $guarded = ['id'];
}
