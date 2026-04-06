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
        return $this->belongsTo(User::class, 'responsible_technician');
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

    public function orderPayments(): HasMany
    {
        return $this->hasMany(OrderPayment::class)->latest('paid_at');
    }
}
