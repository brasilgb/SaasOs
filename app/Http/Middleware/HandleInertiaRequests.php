<?php

namespace App\Http\Middleware;

use App\Models\Admin\Plan;
use App\Models\Admin\Setting;
use App\Models\User;
use App\Models\App\WhatsappMessage;
use App\Models\App\Message;
use App\Models\App\Company;
use App\Models\App\Other;
use App\Models\App\Equipment;
use App\Models\App\Customer;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
{
    [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

    $user = $request->user();
    $tenant = $user?->tenant;

    $subscription = null;

    if ($user) {
        if ($user->roles === 1) { // ajuste se root for outro valor
            $subscription = [
                'is_expired' => false,
                'days_remaining' => null,
                'plan_name' => 'SaaS Root',
            ];
        } else {
            $subscription = [
                'is_expired' => $tenant?->expires_at?->isPast() ?? false,
                'days_remaining' => $tenant?->grace_days_remaining ?? null,
                'plan_name' => $tenant?->plan?->name ?? 'Nenhum',
            ];
        }
    }

    return [
        ...parent::share($request),

        'auth' => [
            'user' => $user,
        ],

        'subscription' => $subscription,

        'company' => $user ? Company::first(['shortname', 'logo', 'companyname', 'cnpj']) : null,
        'setting' => $user ? Setting::first(['name', 'logo']) : null,
        'whatsapp' => $user ? WhatsappMessage::first() : null,
        'othersetting' => $user ? Other::first() : null,

        'notifications' => $user
            ? Message::where('recipient_id', $user->id)->where('status', '0')->count()
            : 0,

        'equipments' => $user ? Equipment::all() : [],
        'customers' => $user ? Customer::all() : [],

        'technicals' => $user
            ? User::whereIn('roles', [1, 3])->where('status', 1)->get()
            : [],

        'plans' => $tenant ? Plan::all() : [],

        'name' => config('app.name'),

        'quote' => [
            'message' => trim($message),
            'author' => trim($author),
        ],

        'ziggy' => fn () => [
            ...(new Ziggy)->toArray(),
            'url' => config('app.url'),
            'location' => $request->url(),
            'query' => $request->query(),
        ],

        'sidebarOpen' =>
            ! $request->hasCookie('sidebar_state') ||
            $request->cookie('sidebar_state') === 'true',

        'app' => [
            'name' => config('app.name'),
            'url' => config('app.url'),
        ],
    ];
}

}
