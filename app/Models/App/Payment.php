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
        'idempotency_key',
        'expires_at',
        'raw_response',
    ];

    protected $casts = [
        'raw_response' => 'array',
        'expires_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
