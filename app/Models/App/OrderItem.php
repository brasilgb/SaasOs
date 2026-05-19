<?php

namespace App\Models\App;

use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory, Tenantable;

    public const TYPE_SERVICE = 'service';
    public const TYPE_PRODUCT = 'product';

    public const SOURCE_ORDER_SERVICE = 'order_service';
    public const SOURCE_PART = 'part';

    protected $fillable = [
        'tenant_id',
        'order_id',
        'item_type',
        'source_type',
        'source_id',
        'description',
        'quantity',
        'unit_price',
        'total_price',
        'unit_cost',
        'sort_order',
        'meta',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'meta' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
