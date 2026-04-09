<?php

namespace App\Providers;

use App\Listeners\SetTenantIdInSession;
use App\Support\TenantMailConfig;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Model::unguard();

        Event::listen(
            Login::class,
            SetTenantIdInSession::class
        );

        $tenantId = Auth::user()?->tenant_id ?? session('tenant_id');
        TenantMailConfig::applyForTenantId($tenantId ? (int) $tenantId : null);
    }
}
