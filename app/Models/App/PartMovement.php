<?php

namespace App\Models\App;

use App\Models\User;
use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartMovement extends Model
{
    use HasFactory, Tenantable;

    public const TYPE_STOCK_IN = 'entrada';
    public const TYPE_ORDER_USE = 'uso_os';
    public const TYPE_SALE = 'venda';
    public const TYPE_ADJUSTMENT = 'ajuste';
    public const TYPE_RETURN = 'devolucao';
    public const TYPE_WARRANTY = 'garantia';

    protected $guarded = [];

    public function part()
    {
        return $this->belongsTo(Part::class, 'part_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
