<?php

namespace App\Models\App;

use App\Models\User;
use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountPayable extends Model
{
    use HasFactory, Tenantable;

    protected $table = 'accounts_payable';

    public const SOURCE_MANUAL = 'manual';

    public const SOURCE_TECHNICIAN_COMMISSION = 'technician_commission';

    public const STATUS_PENDING = 'pending';

    public const STATUS_PARTIAL = 'partial';

    public const STATUS_PAID = 'paid';

    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'tenant_id',
        'bill_number',
        'supplier_name',
        'source_type',
        'source_id',
        'description',
        'category',
        'total_amount',
        'paid_amount',
        'balance_amount',
        'due_date',
        'status',
        'payment_method',
        'last_paid_at',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance_amount' => 'decimal:2',
        'due_date' => 'date',
        'last_paid_at' => 'datetime',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AccountPayableLog::class)->latest();
    }
}
