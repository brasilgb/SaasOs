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
            'nfse_simple_option' => 'integer',
            'nfse_special_tax_regime' => 'integer',
            'default_iss_rate' => 'decimal:4',
            'api_token' => 'encrypted',
            'webhook_secret' => 'encrypted',
        ];
    }

    public function usesNationalNfse(): bool
    {
        return $this->nfse_enabled && ($this->nfse_mode ?? 'national') === 'national';
    }
}
