<?php

namespace App\Models\App;

use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsappConnection extends Model
{
    use HasFactory, Tenantable;

    protected $guarded = ['id'];

    protected $casts = [
        'connected_at' => 'datetime',
        'disconnected_at' => 'datetime',
        'last_synced_at' => 'datetime',
    ];

    public const STATUS_DISCONNECTED = 'disconnected';

    public const STATUS_STARTING = 'starting';

    public const STATUS_QR_REQUIRED = 'qr_required';

    public const STATUS_CONNECTED = 'connected';

    public const STATUS_FAILED = 'failed';

    public function isConnected(): bool
    {
        return $this->status === self::STATUS_CONNECTED;
    }
}
