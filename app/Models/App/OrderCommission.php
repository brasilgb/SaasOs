<?php

namespace App\Models\App;

use App\Models\User;
use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderCommission extends Model
{
    use HasFactory, Tenantable;

    protected $fillable = [
        'tenant_id',
        'order_id',
        'user_id',
        'account_payable_id',
        'base_amount',
        'commission_percentage',
        'commission_amount',
    ];

    protected $casts = [
        'base_amount' => 'decimal:2',
        'commission_percentage' => 'decimal:2',
        'commission_amount' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function accountPayable(): BelongsTo
    {
        return $this->belongsTo(AccountPayable::class);
    }
}
