<?php

namespace App\Models\App;

use App\Models\Tenant;
use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountReceivable extends Model
{
    use HasFactory, Tenantable;

    protected $table = 'accounts_receivable';

    public const SOURCE_ORDER = 'order';
    public const SOURCE_SALE = 'sale';

    public const STATUS_PENDING = 'pending';
    public const STATUS_PARTIAL = 'partial';
    public const STATUS_PAID = 'paid';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'source_type',
        'source_id',
        'description',
        'total_amount',
        'paid_amount',
        'balance_amount',
        'due_date',
        'status',
        'payment_method',
        'installment_number',
        'installments_total',
        'last_paid_at',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance_amount' => 'decimal:2',
        'due_date' => 'date',
        'last_paid_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
