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
use Illuminate\Support\Facades\Auth;
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
    protected $rootView = 'app';

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

        return [
            ...parent::share($request),
            'flash' => [
                'message' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
            'company' => Company::first(['shortname', 'logo', 'companyname', 'cnpj']),
            'setting' => Setting::first(['name', 'logo']),
            'whatsapp' => WhatsappMessage::first(),
            'othersetting' => Other::first(),
            'notifications' => $request->user() ? Message::where('recipient_id', $request->user()->id)->where('status', '0')->count() : '0',
            'equipments' => Equipment::get(),
            'customers' => Customer::get(),
            'technicals' => User::where('roles', 3)->orWhere('roles', 1)->where('status', 1)->get(),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'plan' => $request->user() ? Plan::where('id', $request->user()->tenant->plan)->first()->name : null ,
                'user' => $request->user(),
            ],
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
                'query' => $request->query(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'app' => [
                'name' => config('app.name'),
                'url' => config('app.url'),
            ],
        ];
    }
}
