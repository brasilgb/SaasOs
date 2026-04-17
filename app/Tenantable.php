<?php

namespace App;

use App\Models\Scopes\TenantScope;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;

// use App\Helpers\CustomHelpers;

trait Tenantable
{
    protected static function resolveTenantId(): ?int
    {
        return resolveCurrentTenantId();
    }

    protected static function bootTenantable()
    {
        static::addGlobalScope(new TenantScope);
        static::creating(function ($model) {
            if (empty($model->tenant_id) && checkTenantId()) {
                $model->tenant_id = static::resolveTenantId();
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function resolveRouteBinding($value, $field = null)
    {
        $field ??= $this->getRouteKeyName();
        $query = $this->newQuery()->where($field, $value);
        $tenantId = static::resolveTenantId();

        if (! is_null($tenantId)) {
            $query->where($this->getTable().'.tenant_id', $tenantId);
        }

        return $query->firstOrFail();
    }
}
