<?php

namespace App\Models\App;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'tenant_id',
        'gateway',
        'payment_id',
        'amount',
        'status',
        'raw_response',
    ];

    protected $casts = [
        'raw_response' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
