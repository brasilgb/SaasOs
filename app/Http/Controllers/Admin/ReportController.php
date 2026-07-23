<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\App\Customer;
use App\Models\App\Order;
use App\Models\Tenant;
use App\Models\User;
use App\Support\OrderStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'search' => ['nullable', 'string', 'max:120'],
            'activity' => ['nullable', 'in:all,active,inactive,never'],
        ]);

        $start = isset($filters['start_date'])
            ? Carbon::parse($filters['start_date'])->startOfDay()
            : now()->subDays(29)->startOfDay();
        $end = isset($filters['end_date'])
            ? Carbon::parse($filters['end_date'])->endOfDay()
            : now()->endOfDay();
        $search = trim((string) ($filters['search'] ?? ''));
        $activity = $filters['activity'] ?? 'all';
        $activeSince = now()->subDays(30);

        $tenantQuery = Tenant::query()
            ->with('plan:id,name')
            ->withCount([
                'branches',
                'users',
                'users as active_users_count' => fn (Builder $query) => $query->where('status', 1),
                'orders',
                'customers',
                'customers as period_customers_count' => fn (Builder $query) => $query->whereBetween('created_at', [$start, $end]),
                'customers as customers_with_period_orders_count' => fn (Builder $query) => $query->whereHas(
                    'orders',
                    fn (Builder $query) => $query->whereBetween('created_at', [$start, $end])
                ),
                'orders as period_orders_count' => fn (Builder $query) => $query->whereBetween('created_at', [$start, $end]),
                'orders as delivered_orders_count' => fn (Builder $query) => $query
                    ->whereBetween('created_at', [$start, $end])
                    ->where('service_status', OrderStatus::DELIVERED),
                'orders as open_orders_count' => fn (Builder $query) => $query
                    ->whereNotIn('service_status', [
                        OrderStatus::CANCELLED,
                        OrderStatus::SERVICE_NOT_EXECUTED,
                        OrderStatus::DELIVERED,
                    ]),
            ])
            ->withMax('users', 'last_login_at')
            ->withMax('orders', 'created_at')
            ->withMax('customers', 'created_at')
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $query) use ($search) {
                $query->where('company', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->when($activity === 'active', fn (Builder $query) => $query->whereHas(
                'users',
                fn (Builder $query) => $query->where('last_login_at', '>=', $activeSince)
            ))
            ->when($activity === 'inactive', fn (Builder $query) => $query
                ->whereHas('users', fn (Builder $query) => $query->whereNotNull('last_login_at'))
                ->whereDoesntHave('users', fn (Builder $query) => $query->where('last_login_at', '>=', $activeSince)))
            ->when($activity === 'never', fn (Builder $query) => $query->whereDoesntHave(
                'users',
                fn (Builder $query) => $query->whereNotNull('last_login_at')
            ))
            ->orderByDesc('users_max_last_login_at')
            ->orderBy('company');

        $tenants = $tenantQuery->get()->map(fn (Tenant $tenant) => [
            'id' => $tenant->id,
            'company' => $tenant->company ?: $tenant->name,
            'contact' => $tenant->name,
            'email' => $tenant->email,
            'plan' => $tenant->plan?->name ?? 'Sem plano',
            'subscription' => $tenant->subscriptionLabel(),
            'users_count' => $tenant->users_count,
            'active_users_count' => $tenant->active_users_count,
            'branches_count' => $tenant->branches_count,
            'customers_count' => $tenant->customers_count,
            'period_customers_count' => $tenant->period_customers_count,
            'customers_with_period_orders_count' => $tenant->customers_with_period_orders_count,
            'orders_count' => $tenant->orders_count,
            'period_orders_count' => $tenant->period_orders_count,
            'delivered_orders_count' => $tenant->delivered_orders_count,
            'open_orders_count' => $tenant->open_orders_count,
            'last_login_at' => $tenant->users_max_last_login_at,
            'last_order_at' => $tenant->orders_max_created_at,
            'last_customer_at' => $tenant->customers_max_created_at,
        ]);

        $tenantIds = $tenants->pluck('id');
        $periodOrders = Order::query()
            ->whereIn('tenant_id', $tenantIds)
            ->whereBetween('created_at', [$start, $end]);
        $userQuery = User::query()->whereIn('tenant_id', $tenantIds);
        $customerQuery = Customer::query()->whereIn('tenant_id', $tenantIds);

        return Inertia::render('admin/reports/index', [
            'filters' => [
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'search' => $search,
                'activity' => $activity,
            ],
            'summary' => [
                'tenants' => $tenants->count(),
                'users' => (clone $userQuery)->count(),
                'active_users' => (clone $userQuery)->where('last_login_at', '>=', $activeSince)->count(),
                'customers' => (clone $customerQuery)->count(),
                'new_customers' => (clone $customerQuery)->whereBetween('created_at', [$start, $end])->count(),
                'customers_with_orders' => (clone $customerQuery)->whereHas(
                    'orders',
                    fn (Builder $query) => $query->whereBetween('created_at', [$start, $end])
                )->count(),
                'orders' => (clone $periodOrders)->count(),
                'delivered_orders' => (clone $periodOrders)->where('service_status', OrderStatus::DELIVERED)->count(),
                'open_orders' => Order::query()->whereIn('tenant_id', $tenantIds)->whereNotIn('service_status', [
                    OrderStatus::CANCELLED,
                    OrderStatus::SERVICE_NOT_EXECUTED,
                    OrderStatus::DELIVERED,
                ])->count(),
            ],
            'tenants' => $tenants,
            'generated_at' => now()->toIso8601String(),
        ]);
    }
}
