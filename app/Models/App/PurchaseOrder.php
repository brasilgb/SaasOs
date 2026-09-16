<?php

namespace App\Models\App;

use App\Models\User;
use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    use HasFactory, Tenantable;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_SENT = 'sent';

    public const STATUS_RECEIVED = 'received';

    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'tenant_id',
        'purchase_order_number',
        'supplier_id',
        'status',
        'total_amount',
        'expected_date',
        'received_at',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'expected_date' => 'date',
        'received_at' => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(PurchaseOrderLog::class)->latest();
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
