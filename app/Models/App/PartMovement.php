<?php

namespace App\Models\App;

use App\Models\User;
use App\Tenantable;
use Illuminate\Database\Eloquent\Model;

class PartMovement extends Model
{
    use Tenantable;

    protected $guarded = [];

    public function part()
    {
        return $this->belongsTo(Part::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}