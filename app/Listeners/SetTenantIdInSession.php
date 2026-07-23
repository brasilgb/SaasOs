<?php

namespace App\Listeners;

class SetTenantIdInSession
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        $event->user->forceFill(['last_login_at' => now()])->saveQuietly();

        if (is_null($event->user->tenant_id)) {
            session()->forget('tenant_id');

            return;
        }

        session(['tenant_id' => (int) $event->user->tenant_id]);
    }
}
