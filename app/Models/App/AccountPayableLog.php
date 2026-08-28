<?php

namespace App\Models\App;

use App\Models\User;
use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountPayableLog extends Model
{
    use HasFactory, Tenantable;

    protected $fillable = [
        'tenant_id',
        'account_payable_id',
        'user_id',
        'action',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function accountPayable(): BelongsTo
    {
        return $this->belongsTo(AccountPayable::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
