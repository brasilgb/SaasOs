<?php

namespace App\Models\App;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'user_id',
        'action',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
