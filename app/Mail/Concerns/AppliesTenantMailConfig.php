<?php

namespace App\Mail\Concerns;

use App\Support\TenantMailConfig;

trait AppliesTenantMailConfig
{
    protected function applyTenantMailConfig(?int $tenantId): void
    {
        TenantMailConfig::applyForTenantId($tenantId);
    }
}
