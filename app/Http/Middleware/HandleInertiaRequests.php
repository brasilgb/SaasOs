<?php

namespace App\Http\Middleware;

use App\Models\Admin\Plan;
use App\Models\Admin\Setting;
use App\Models\App\Company;
use App\Models\App\CashSession;
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Message;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Models\App\Other;
use App\Models\App\WhatsappMessage;
use App\Models\User;
use App\Support\OrderStatus;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    private function commercialPerformanceAlert(?User $user): ?array
    {
        if (! $user || ! $user->hasPermission('orders')) {
            return null;
        }

        $from = now()->subDays(29)->startOfDay();
        $to = now()->endOfDay();

        $budgetLogs = OrderLog::query()
            ->where('action', 'budget_follow_up_sent')
            ->whereBetween('created_at', [$from, $to])
            ->whereHas('order')
            ->with('order')
            ->get();

        $paymentLogs = OrderLog::query()
            ->where('action', 'payment_reminder_sent')
            ->whereBetween('created_at', [$from, $to])
            ->whereHas('order')
            ->with('order.orderPayments')
            ->get();

        $budgetRate = $budgetLogs->count() > 0
            ? round(($budgetLogs->filter(fn ($log) => $log->order && ! in_array((int) $log->order->service_status, [
                OrderStatus::BUDGET_GENERATED,
                OrderStatus::BUDGET_REJECTED,
                OrderStatus::CANCELLED,
            ], true))->count() / $budgetLogs->count()) * 100, 1)
            : 0.0;

        $paymentRate = $paymentLogs->count() > 0
            ? round(($paymentLogs->filter(function ($log) {
                if (! $log->order) {
                    return false;
                }

                $serviceCost = (float) ($log->order->service_cost ?? 0);
                $paid = (float) $log->order->orderPayments->sum('amount');

                return ($serviceCost - $paid) <= 0.009;
            })->count() / $paymentLogs->count()) * 100, 1)
            : 0.0;

        $budgetTarget = Other::budgetConversionTarget($user->tenant_id);
        $paymentTarget = Other::paymentRecoveryTarget($user->tenant_id);

        return [
            'hasAlert' => $budgetRate < $budgetTarget || $paymentRate < $paymentTarget,
            'budgetBelowTarget' => $budgetRate < $budgetTarget,
            'paymentBelowTarget' => $paymentRate < $paymentTarget,
            'budgetRate' => $budgetRate,
            'paymentRate' => $paymentRate,
        ];
    }

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

        $otherSetting = null;
        $openCashSession = null;
        if ($user) {
            $otherSetting = Other::query()->firstOrCreate([]);
            $openCashSession = CashSession::query()
                ->where('status', 'open')
                ->latest('opened_at')
                ->first();
        }

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user,
                'role' => $user?->roleKey(),
                'permissions' => $user?->permissions() ?? [],
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'subscription' => $subscription,

            'company' => $user ? Company::first(['shortname', 'logo', 'companyname', 'cnpj']) : null,
            'setting' => $user ? Setting::first(['name', 'logo']) : null,
            'whatsapp' => $user ? WhatsappMessage::first() : null,
            'othersetting' => $otherSetting,
            'cashier' => $user ? [
                'isOpen' => (bool) $openCashSession,
                'openedAt' => $openCashSession?->opened_at?->toIso8601String(),
            ] : null,
            'performanceAlert' => $this->commercialPerformanceAlert($user),
            'orderStatus' => $user ? Order::where('service_status', OrderStatus::BUDGET_APPROVED)->get() : null,

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

            'sidebarOpen' => ! $request->hasCookie('sidebar_state') ||
                $request->cookie('sidebar_state') === 'true',

            'app' => [
                'name' => config('app.name'),
                'url' => config('app.url'),
            ],
        ];
    }
}
