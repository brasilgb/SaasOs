<?php

namespace App\Models\App;

use App\Models\User;
use App\Models\Tenant;
use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    use HasFactory, Tenantable;

    protected $fillable = [
        'sales_number',
        'tenant_id',
        'customer_id',
        'cash_session_id',
        'total_amount',
        'paid_amount',
        'financial_status',
        'payment_method',
        'status',
        'cancelled_by',
        'cancel_reason',
        'fiscal_document_number',
        'fiscal_document_key',
        'fiscal_document_url',
        'fiscal_issued_at',
        'fiscal_registered_by',
        'fiscal_notes',
    ];

    protected $casts = [
        'cancelled_at' => 'datetime',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'fiscal_issued_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function cashSession(): BelongsTo
    {
        return $this->belongsTo(CashSession::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function fiscalRegisteredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'fiscal_registered_by');
    }

    public function fiscalDocuments(): HasMany
    {
        return $this->hasMany(FiscalDocument::class, 'documentable_id')
            ->where('documentable_type', self::class)
            ->latest();
    }

    public function logs(): HasMany
    {
        return $this->hasMany(SaleLog::class)->latest();
    }
}
