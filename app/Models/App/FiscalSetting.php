<?php

namespace App\Models\App;

use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FiscalSetting extends Model
{
    use HasFactory, Tenantable;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'nfe_enabled' => 'boolean',
            'nfse_enabled' => 'boolean',
            'api_token' => 'encrypted',
            'webhook_secret' => 'encrypted',
        ];
    }
}
