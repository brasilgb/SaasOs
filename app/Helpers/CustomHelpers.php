<?php

use Illuminate\Support\Facades\Auth;

if (! function_exists('resolveCurrentTenantId')) {

    function resolveCurrentTenantId(): ?int
    {
        if (Auth::hasUser()) {
            $tenantId = Auth::user()?->tenant_id;

            return is_null($tenantId) ? null : (int) $tenantId;
        }

        if (session()->has('tenant_id') && ! is_null(session('tenant_id'))) {
            return (int) session('tenant_id');
        }

        return null;
    }

}

if (! function_exists('checkTenantId')) {

    function checkTenantId()
    {
        return ! is_null(resolveCurrentTenantId());
    }

}
