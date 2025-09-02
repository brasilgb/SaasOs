<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Tenantable;

class Order extends Model
{
    use Tenantable;
    protected $guarded = ['allparts'];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(Image::class);
    }

    public function parts(): BelongsToMany
    {
        return $this->belongsToMany(Part::class, 'order_parts')
            ->withPivot('quantity');
    }
}
