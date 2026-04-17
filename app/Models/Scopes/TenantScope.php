<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (checkTenantId()) {
            $tenantId = resolveCurrentTenantId();

            if (! is_null($tenantId)) {
                $builder->where('tenant_id', $tenantId);
            }
        }
    }
}
