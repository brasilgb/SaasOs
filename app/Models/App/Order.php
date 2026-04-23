<?php

namespace App\Models\App;

use App\Models\User;
use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory, Tenantable;

    protected $guarded = ['allparts'];

    protected $casts = [
        'delivery_date' => 'datetime',
        'warranty_expires_at' => 'datetime',
        'fiscal_issued_at' => 'datetime',
        'customer_notification_acknowledged_at' => 'datetime',
        'customer_pickup_acknowledged_at' => 'datetime',
        'customer_feedback_submitted_at' => 'datetime',
        'customer_feedback_recovery_updated_at' => 'datetime',
        'budget_follow_up_paused_at' => 'datetime',
        'payment_follow_up_paused_at' => 'datetime',
        'budget_follow_up_snoozed_until' => 'datetime',
        'payment_follow_up_snoozed_until' => 'datetime',
        'budget_follow_up_response_at' => 'datetime',
        'payment_follow_up_response_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(Image::class);
    }

    public function orderParts(): BelongsToMany
    {
        return $this->belongsToMany(Part::class, 'order_parts')
            ->using(OrderPart::class)
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function statusHistory()
    {
        return $this->hasMany(OrderStatusHistory::class)->latest();
    }

    public function logs(): HasMany
    {
        return $this->hasMany(OrderLog::class)->latest('created_at');
    }

    public function orderPayments(): HasMany
    {
        return $this->hasMany(OrderPayment::class)->latest('paid_at');
    }

    public function fiscalDocuments(): HasMany
    {
        return $this->hasMany(FiscalDocument::class, 'documentable_id')
            ->where('documentable_type', self::class)
            ->latest();
    }

    public function warrantySourceOrder(): BelongsTo
    {
        return $this->belongsTo(self::class, 'warranty_source_order_id');
    }

    public function budgetFollowUpAssignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'budget_follow_up_assigned_to');
    }

    public function paymentFollowUpAssignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payment_follow_up_assigned_to');
    }

    public function customerFeedbackRecoveryAssignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_feedback_recovery_assigned_to');
    }
}
