<?php

namespace App\Models\App;

use App\Models\User;
use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceContractLog extends Model
{
    use HasFactory, Tenantable;

    protected $fillable = [
        'tenant_id',
        'maintenance_contract_id',
        'user_id',
        'action',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function maintenanceContract(): BelongsTo
    {
        return $this->belongsTo(MaintenanceContract::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
