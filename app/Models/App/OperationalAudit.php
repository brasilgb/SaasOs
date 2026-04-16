<?php

namespace App\Models\App;

use App\Tenantable;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OperationalAudit extends Model
{
    use HasFactory, Tenantable;

    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'entity_type',
        'entity_id',
        'action',
        'data',
        'created_at',
    ];

    protected $casts = [
        'data' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
