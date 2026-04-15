<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Models\App\Other;
use App\Models\User;
use App\Support\OrderStatus;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FollowUpController extends Controller
{
    private const RESPONSE_LABELS = [
        'responded' => 'Cliente respondeu',
        'no_interest' => 'Sem interesse',
        'waiting_piece' => 'Aguardando peça',
        'promised_payment' => 'Prometeu pagar',
    ];

    private function currentUser(): ?User
    {
        $user = Auth::user();

        return $user instanceof User ? $user : null;
    }

    private function authorizeFollowUpAccess(): void
    {
        abort_unless($this->currentUser()?->hasPermission('orders'), 403);
    }

    private function canManageOrders(): bool
    {
        $user = $this->currentUser();

        return $user?->hasPermission('orders') && ! $user->isTechnician();
    }

    private function canAccessOrder(Order $order): bool
    {
        $user = $this->currentUser();

        if (! $user?->hasPermission('orders')) {
            return false;
        }

        if (! $user->isTechnician()) {
            return true;
        }

        return is_null($order->user_id) || (int) $order->user_id === (int) $user->id;
    }

    private function logOrderAction(Order $order, string $action, array $data = []): void
    {
        OrderLog::create([
            'order_id' => $order->id,
            'user_id' => $this->currentUser()?->id,
            'action' => $action,
            'data' => $data === [] ? null : $data,
            'created_at' => now(),
        ]);
    }

    private function scopeColumns(string $scope): array
    {
        return match ($scope) {
            'budget' => [
                'paused_at' => 'budget_follow_up_paused_at',
                'paused_by' => 'budget_follow_up_paused_by',
                'reason' => 'budget_follow_up_pause_reason',
                'snoozed_until' => 'budget_follow_up_snoozed_until',
                'assigned_to' => 'budget_follow_up_assigned_to',
                'response_status' => 'budget_follow_up_response_status',
                'response_at' => 'budget_follow_up_response_at',
                'log_pause' => 'budget_follow_up_paused',
                'log_resume' => 'budget_follow_up_resumed',
                'log_response' => 'budget_follow_up_response_marked',
                'log_task_completed' => 'budget_follow_up_task_completed',
                'log_task_snoozed' => 'budget_follow_up_task_snoozed',
                'log_task_assigned' => 'budget_follow_up_task_assigned',
            ],
            'payment' => [
                'paused_at' => 'payment_follow_up_paused_at',
                'paused_by' => 'payment_follow_up_paused_by',
                'reason' => 'payment_follow_up_pause_reason',
                'snoozed_until' => 'payment_follow_up_snoozed_until',
                'assigned_to' => 'payment_follow_up_assigned_to',
                'response_status' => 'payment_follow_up_response_status',
                'response_at' => 'payment_follow_up_response_at',
                'log_pause' => 'payment_follow_up_paused',
                'log_resume' => 'payment_follow_up_resumed',
                'log_response' => 'payment_follow_up_response_marked',
                'log_task_completed' => 'payment_follow_up_task_completed',
                'log_task_snoozed' => 'payment_follow_up_task_snoozed',
                'log_task_assigned' => 'payment_follow_up_task_assigned',
            ],
            default => abort(422, 'Escopo de follow-up inválido.'),
        };
    }

    private function responseLabel(?string $status): ?string
    {
        return $status ? (self::RESPONSE_LABELS[$status] ?? $status) : null;
    }

    private function scopeOrdersQuery($query)
    {
        $user = $this->currentUser();

        if ($user?->isTechnician()) {
            $query->where(function ($q) use ($user) {
                $q->whereNull('user_id')
                    ->orWhere('user_id', $user->id);
            });
        }

        return $query;
    }

    private function communicationThresholdDays(): int
    {
        return Other::communicationFollowUpCooldownDays();
    }

    private function latestCommunication(Order $order): ?array
    {
        $log = $order->logs
            ->whereIn('action', ['payment_reminder_sent', 'budget_follow_up_sent'])
            ->sortByDesc('created_at')
            ->first();

        if (! $log) {
            return null;
        }

        $data = is_array($log->data) ? $log->data : [];

        return [
            'action' => $log->action,
            'trigger' => $data['trigger'] ?? null,
            'channel' => $data['channel'] ?? null,
            'recipient' => $data['recipient'] ?? null,
            'created_at' => $log->created_at?->toIso8601String(),
        ];
    }

    private function metricsPeriod(Request $request): array
    {
        $from = $request->filled('from')
            ? Carbon::parse((string) $request->get('from'))->startOfDay()
            : now()->subDays(29)->startOfDay();

        $to = $request->filled('to')
            ? Carbon::parse((string) $request->get('to'))->endOfDay()
            : now()->endOfDay();

        if ($from->gt($to)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        return [$from, $to];
    }

    private function baseLogQuery(string $action, Carbon $from, Carbon $to, ?string $trigger = null, ?int $userId = null)
    {
        return OrderLog::query()
            ->where('action', $action)
            ->whereBetween('created_at', [$from, $to])
            ->when($trigger, fn ($query) => $query->whereJsonContains('data->trigger', $trigger))
            ->whereHas('order', function ($query) use ($userId) {
                $this->scopeOrdersQuery($query);

                if ($userId) {
                    $query->where('user_id', $userId);
                }
            })
            ->with(['order']);
    }

    private function recoveredFromLogs(Collection $logs, string $scope): int
    {
        return $logs->filter(function (OrderLog $log) use ($scope) {
            $order = $log->order;

            if (! $order) {
                return false;
            }

            if ($scope === 'budget') {
                return ! in_array((int) $order->service_status, [
                    OrderStatus::BUDGET_GENERATED,
                    OrderStatus::BUDGET_REJECTED,
                    OrderStatus::CANCELLED,
                ], true);
            }

            $serviceCost = (float) ($order->service_cost ?? 0);
            $paid = (float) $order->orderPayments()->sum('amount');

            return ($serviceCost - $paid) <= 0.009;
        })->count();
    }

    private function trendGranularity(Carbon $from, Carbon $to): string
    {
        $days = $from->diffInDays($to) + 1;

        if ($days > 90) {
            return 'monthly';
        }

        if ($days > 31) {
            return 'weekly';
        }

        return 'daily';
    }

    private function buildTrend(Collection $logs, Carbon $from, Carbon $to, string $scope): array
    {
        $granularity = $this->trendGranularity($from, $to);

        $periods = match ($granularity) {
            'monthly' => CarbonPeriod::create($from->copy()->startOfMonth(), '1 month', $to->copy()->startOfMonth()),
            'weekly' => CarbonPeriod::create($from->copy()->startOfWeek(), '1 week', $to->copy()->startOfWeek()),
            default => CarbonPeriod::create($from->copy(), '1 day', $to->copy()),
        };

        $data = collect($periods)->map(function (Carbon $periodStart) use ($logs, $granularity, $scope) {
            [$start, $end, $label] = match ($granularity) {
                'monthly' => [$periodStart->copy()->startOfMonth(), $periodStart->copy()->endOfMonth(), $periodStart->format('MM/YYYY')],
                'weekly' => [$periodStart->copy()->startOfWeek(), $periodStart->copy()->endOfWeek(), $periodStart->format('d/m')],
                default => [$periodStart->copy()->startOfDay(), $periodStart->copy()->endOfDay(), $periodStart->format('d/m')],
            };

            $bucket = $logs->filter(fn (OrderLog $log) => $log->created_at?->between($start, $end));
            $contacted = $bucket->count();
            $recovered = $this->recoveredFromLogs($bucket, $scope);

            return [
                'label' => $label,
                'contacted' => $contacted,
                'recovered' => $recovered,
                'rate' => $this->percentage($recovered, $contacted),
            ];
        })->values()->all();

        return [
            'granularity' => $granularity,
            'data' => $data,
        ];
    }

    private function appendFollowUpData(Order $order): Order
    {
        $totalOrder = round((float) ($order->service_cost ?? 0), 2);
        $totalPaid = round((float) ($order->total_paid ?? 0), 2);
        $remaining = round(max(0, $totalOrder - $totalPaid), 2);
        $referenceDate = $order->delivery_date ?? $order->updated_at ?? $order->created_at;
        $daysPending = $referenceDate ? max(0, (int) floor(Carbon::parse($referenceDate)->diffInDays(now(), true))) : 0;

        $order->setAttribute('remaining_amount', $remaining);
        $order->setAttribute('communication_days_pending', $daysPending);
        $order->setAttribute('last_communication', $this->latestCommunication($order));
        $order->setAttribute('budget_follow_up_paused', ! is_null($order->budget_follow_up_paused_at));
        $order->setAttribute('payment_follow_up_paused', ! is_null($order->payment_follow_up_paused_at));
        $order->setAttribute('budget_follow_up_snoozed', $order->budget_follow_up_snoozed_until?->isFuture() ?? false);
        $order->setAttribute('payment_follow_up_snoozed', $order->payment_follow_up_snoozed_until?->isFuture() ?? false);
        $order->setAttribute('budget_follow_up_response_label', $this->responseLabel($order->budget_follow_up_response_status));
        $order->setAttribute('payment_follow_up_response_label', $this->responseLabel($order->payment_follow_up_response_status));
        $order->setAttribute('next_action', $this->nextActionRecommendation($order));
        $order->setAttribute(
            'can_send_budget_follow_up',
            (int) $order->service_status === OrderStatus::BUDGET_GENERATED
                && ! empty($order->customer?->email)
        );
        $order->setAttribute(
            'can_send_payment_reminder',
            $remaining > 0.009
                && ! empty($order->customer?->email)
        );

        return $order;
    }

    private function nextActionRecommendation(Order $order): array
    {
        $remaining = round(max(0, (float) ($order->service_cost ?? 0) - (float) ($order->total_paid ?? 0)), 2);

        if (($order->budget_follow_up_snoozed_until?->isFuture() ?? false) || ($order->payment_follow_up_snoozed_until?->isFuture() ?? false)) {
            return [
                'label' => 'Aguardar data reagendada',
                'priority' => 'normal',
            ];
        }

        if ((bool) $order->budget_follow_up_paused || (bool) $order->payment_follow_up_paused) {
            return [
                'label' => 'Revisar pausa',
                'priority' => 'normal',
            ];
        }

        if ($order->budget_follow_up_response_status === 'waiting_piece') {
            return [
                'label' => 'Acompanhar peça',
                'priority' => 'normal',
            ];
        }

        if ($order->payment_follow_up_response_status === 'promised_payment') {
            return [
                'label' => 'Confirmar pagamento prometido',
                'priority' => 'alta',
            ];
        }

        if ((int) $order->service_status === OrderStatus::BUDGET_GENERATED) {
            return [
                'label' => $order->last_communication ? 'Retomar orçamento' : 'Cobrar orçamento',
                'priority' => ($order->communication_days_pending ?? 0) >= 10 ? 'critica' : 'alta',
            ];
        }

        if ($remaining > 0.009) {
            return [
                'label' => $order->last_communication ? 'Cobrar saldo novamente' : 'Cobrar saldo',
                'priority' => ($order->communication_days_pending ?? 0) >= 10 ? 'critica' : 'alta',
            ];
        }

        return [
            'label' => 'Acompanhar resposta do cliente',
            'priority' => 'normal',
        ];
    }

    private function dailyAgenda(Collection $budgetOrders, Collection $paymentOrders, ?int $limit = 8): array
    {
        $mapAgenda = function (Collection $orders, string $scope, string $label) {
            $columns = $this->scopeColumns($scope);

            return $orders
                ->reject(function (Order $order) use ($columns) {
                    $snoozedUntil = $order->{$columns['snoozed_until']};

                    if ($snoozedUntil instanceof Carbon && $snoozedUntil->isFuture()) {
                        return true;
                    }

                    return $order->logs
                        ->where('action', $columns['log_task_completed'])
                        ->contains(fn (OrderLog $log) => $log->created_at?->isToday());
                })
                ->map(function (Order $order) use ($label, $scope, $columns) {
                return [
                    'id' => $order->id,
                    'scope' => $scope,
                    'order_number' => $order->order_number,
                    'customer' => $order->customer?->name,
                    'technician' => $order->user?->name ?? 'Não definido',
                    'assigned_to' => match ($scope) {
                        'budget' => $order->budgetFollowUpAssignee?->name,
                        'payment' => $order->paymentFollowUpAssignee?->name,
                    },
                    'assigned_to_id' => match ($scope) {
                        'budget' => $order->budget_follow_up_assigned_to,
                        'payment' => $order->payment_follow_up_assigned_to,
                    },
                    'type' => $label,
                    'days_pending' => (int) ($order->communication_days_pending ?? 0),
                    'next_action' => $order->next_action,
                    'snoozed_until' => optional($order->{$columns['snoozed_until']})->toIso8601String(),
                ];
                });
        };

        $agenda = $mapAgenda($budgetOrders, 'budget', 'orçamento')
            ->concat($mapAgenda($paymentOrders, 'payment', 'cobrança'))
            ->sortByDesc(fn (array $item) => match ($item['next_action']['priority'] ?? 'normal') {
                'critica' => 3,
                'alta' => 2,
                default => 1,
            } * 100 + ($item['days_pending'] ?? 0));

        if (! is_null($limit)) {
            $agenda = $agenda->take($limit);
        }

        return $agenda->values()->all();
    }

    private function baseQuery(Request $request)
    {
        $query = $this->scopeOrdersQuery(
            Order::query()
                ->with([
                    'customer:id,name,email,whatsapp,phone',
                    'equipment:id,equipment',
                    'user:id,name',
                    'budgetFollowUpAssignee:id,name',
                    'paymentFollowUpAssignee:id,name',
                    'logs',
                ])
                ->withSum('orderPayments as total_paid', 'amount')
                ->orderByDesc('updated_at')
        );

        if ($search = trim((string) $request->get('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', $search)
                    ->orWhereHas('customer', function ($customerQuery) use ($search) {
                        $customerQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('cpfcnpj', 'like', "%{$search}%");
                    });
            });
        }

        if ($technicianId = $request->get('technician_id')) {
            $query->where('user_id', $technicianId);
        }

        return $query;
    }

    private function applyResponseFilter($query, Request $request, string $scope)
    {
        $filter = $request->get('response_status');

        if (! $filter || $filter === 'all') {
            return $query;
        }

        $columns = $this->scopeColumns($scope);

        if ($filter === 'none') {
            return $query->whereNull($columns['response_status']);
        }

        return $query->where($columns['response_status'], $filter);
    }

    private function percentage(int $part, int $total): float
    {
        if ($total <= 0) {
            return 0;
        }

        return round(($part / $total) * 100, 1);
    }

    private function recoverySummary(Carbon $from, Carbon $to): array
    {
        $budgetLogs = $this->baseLogQuery('budget_follow_up_sent', $from, $to)->get();
        $paymentLogs = $this->baseLogQuery('payment_reminder_sent', $from, $to)->get();

        $budgetContacted = $budgetLogs->count();
        $budgetRecovered = $this->recoveredFromLogs($budgetLogs, 'budget');
        $paymentContacted = $paymentLogs->count();
        $paymentRecovered = $this->recoveredFromLogs($paymentLogs, 'payment');

        return [
            'budget' => [
                'contacted' => $budgetContacted,
                'recovered' => $budgetRecovered,
                'rate' => $this->percentage($budgetRecovered, $budgetContacted),
            ],
            'payment' => [
                'contacted' => $paymentContacted,
                'recovered' => $paymentRecovered,
                'rate' => $this->percentage($paymentRecovered, $paymentContacted),
            ],
        ];
    }

    private function triggerPerformanceSummary(Carbon $from, Carbon $to): array
    {
        $build = function (string $action, string $scope) use ($from, $to): array {
            $result = [];

            foreach (['manual', 'automatic'] as $trigger) {
                $logs = $this->baseLogQuery($action, $from, $to, $trigger)->get();
                $contacted = $logs->count();
                $recovered = $this->recoveredFromLogs($logs, $scope);

                $result[$trigger] = [
                    'contacted' => $contacted,
                    'recovered' => $recovered,
                    'rate' => $this->percentage($recovered, $contacted),
                ];
            }

            return $result;
        };

        return [
            'budget' => $build('budget_follow_up_sent', 'budget'),
            'payment' => $build('payment_reminder_sent', 'payment'),
        ];
    }

    private function technicianSummary(Collection $budgetOrders, Collection $paymentOrders): array
    {
        return $budgetOrders
            ->map(function (Order $order) {
                return [
                    'key' => 'budget',
                    'user_id' => $order->user?->id,
                    'name' => $order->user?->name ?? 'Não definido',
                    'paused' => (bool) $order->budget_follow_up_paused,
                    'no_contact' => ! $order->last_communication,
                ];
            })
            ->concat(
                $paymentOrders->map(function (Order $order) {
                    return [
                        'key' => 'payment',
                        'user_id' => $order->user?->id,
                        'name' => $order->user?->name ?? 'Não definido',
                        'paused' => (bool) $order->payment_follow_up_paused,
                        'no_contact' => ! $order->last_communication,
                    ];
                })
            )
            ->groupBy(fn (array $item) => $item['user_id'] ?? 'unassigned')
            ->map(function (Collection $items) {
                $first = $items->first();

                return [
                    'user_id' => $first['user_id'],
                    'name' => $first['name'],
                    'budget_follow_ups' => $items->where('key', 'budget')->count(),
                    'payment_follow_ups' => $items->where('key', 'payment')->count(),
                    'paused' => $items->where('paused', true)->count(),
                    'no_contact' => $items->where('no_contact', true)->count(),
                    'total' => $items->count(),
                ];
            })
            ->sortByDesc('total')
            ->values()
            ->all();
    }

    private function technicianRanking(Carbon $from, Carbon $to): array
    {
        return User::query()
            ->where('tenant_id', $this->currentUser()?->tenant_id)
            ->whereIn('roles', [User::ROLE_ADMIN, User::ROLE_TECHNICIAN])
            ->where('status', 1)
            ->get(['id', 'name'])
            ->map(function (User $user) use ($from, $to) {
                $budgetLogs = $this->baseLogQuery('budget_follow_up_sent', $from, $to, null, $user->id)->get();
                $paymentLogs = $this->baseLogQuery('payment_reminder_sent', $from, $to, null, $user->id)->get();

                $budgetContacted = $budgetLogs->count();
                $budgetRecovered = $this->recoveredFromLogs($budgetLogs, 'budget');
                $paymentContacted = $paymentLogs->count();
                $paymentRecovered = $this->recoveredFromLogs($paymentLogs, 'payment');

                $contacted = $budgetContacted + $paymentContacted;
                $recovered = $budgetRecovered + $paymentRecovered;

                return [
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'contacted' => $contacted,
                    'recovered' => $recovered,
                    'rate' => $this->percentage($recovered, $contacted),
                ];
            })
            ->filter(fn (array $item) => $item['contacted'] > 0)
            ->sortBy([
                ['rate', 'asc'],
                ['contacted', 'desc'],
            ])
            ->take(5)
            ->values()
            ->all();
    }

    private function commercialDashboard(Carbon $from, Carbon $to): array
    {
        $budgetLogs = $this->baseLogQuery('budget_follow_up_sent', $from, $to)->get();
        $budgetOrders = $budgetLogs->pluck('order')->filter();
        $budgetContacted = $budgetLogs->count();
        $budgetApproved = $budgetOrders->filter(fn (Order $order) => ! in_array((int) $order->service_status, [
            OrderStatus::BUDGET_GENERATED,
            OrderStatus::BUDGET_REJECTED,
            OrderStatus::CANCELLED,
        ], true))->count();
        $budgetRejected = $budgetOrders->filter(fn (Order $order) => (int) $order->service_status === OrderStatus::BUDGET_REJECTED)->count();
        $budgetPending = max(0, $budgetContacted - $budgetApproved - $budgetRejected);

        $paymentLogs = $this->baseLogQuery('payment_reminder_sent', $from, $to)->get();
        $paymentContacted = $paymentLogs->count();
        $paymentRecovered = $this->recoveredFromLogs($paymentLogs, 'payment');
        $paymentOpen = max(0, $paymentContacted - $paymentRecovered);

        $technicianPerformance = User::query()
            ->where('tenant_id', $this->currentUser()?->tenant_id)
            ->whereIn('roles', [User::ROLE_ADMIN, User::ROLE_TECHNICIAN])
            ->where('status', 1)
            ->get(['id', 'name'])
            ->map(function (User $user) use ($from, $to) {
                $budgetLogs = $this->baseLogQuery('budget_follow_up_sent', $from, $to, null, $user->id)->get();
                $budgetOrders = $budgetLogs->pluck('order')->filter();
                $budgetContacted = $budgetLogs->count();
                $budgetApproved = $budgetOrders->filter(fn (Order $order) => ! in_array((int) $order->service_status, [
                    OrderStatus::BUDGET_GENERATED,
                    OrderStatus::BUDGET_REJECTED,
                    OrderStatus::CANCELLED,
                ], true))->count();

                $paymentLogs = $this->baseLogQuery('payment_reminder_sent', $from, $to, null, $user->id)->get();
                $paymentContacted = $paymentLogs->count();
                $paymentRecovered = $this->recoveredFromLogs($paymentLogs, 'payment');

                return [
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'budget_rate' => $this->percentage($budgetApproved, $budgetContacted),
                    'budget_contacted' => $budgetContacted,
                    'payment_rate' => $this->percentage($paymentRecovered, $paymentContacted),
                    'payment_contacted' => $paymentContacted,
                ];
            })
            ->filter(fn (array $item) => $item['budget_contacted'] > 0 || $item['payment_contacted'] > 0)
            ->sortByDesc(fn (array $item) => $item['budget_rate'] + $item['payment_rate'])
            ->take(5)
            ->values()
            ->all();

        return [
            'budget' => [
                'contacted' => $budgetContacted,
                'approved' => $budgetApproved,
                'rejected' => $budgetRejected,
                'pending' => $budgetPending,
                'rate' => $this->percentage($budgetApproved, $budgetContacted),
            ],
            'payment' => [
                'contacted' => $paymentContacted,
                'recovered' => $paymentRecovered,
                'open' => $paymentOpen,
                'rate' => $this->percentage($paymentRecovered, $paymentContacted),
            ],
            'technicians' => $technicianPerformance,
        ];
    }

    private function comparisonSummary(Carbon $from, Carbon $to): array
    {
        $days = max(1, $from->diffInDays($to) + 1);
        $previousTo = $from->copy()->subDay()->endOfDay();
        $previousFrom = $previousTo->copy()->subDays($days - 1)->startOfDay();

        $currentRecovery = $this->recoverySummary($from, $to);
        $previousRecovery = $this->recoverySummary($previousFrom, $previousTo);

        $build = function (float $current, float $previous): array {
            $delta = round($current - $previous, 1);

            return [
                'current' => $current,
                'previous' => $previous,
                'delta' => $delta,
                'direction' => $delta > 0 ? 'melhorou' : ($delta < 0 ? 'piorou' : 'estavel'),
            ];
        };

        return [
            'period' => [
                'from' => $previousFrom->toDateString(),
                'to' => $previousTo->toDateString(),
            ],
            'budget' => $build(
                (float) ($currentRecovery['budget']['rate'] ?? 0),
                (float) ($previousRecovery['budget']['rate'] ?? 0)
            ),
            'payment' => $build(
                (float) ($currentRecovery['payment']['rate'] ?? 0),
                (float) ($previousRecovery['payment']['rate'] ?? 0)
            ),
        ];
    }

    private function targetStatus(float $current, float $target): array
    {
        $delta = round($current - $target, 1);

        return [
            'target' => $target,
            'delta' => $delta,
            'status' => $delta >= 0 ? 'saudavel' : 'atencao',
        ];
    }

    public function index(Request $request)
    {
        $this->authorizeFollowUpAccess();

        $thresholdDays = $this->communicationThresholdDays();
        $type = $request->get('type', 'all');
        [$metricsFrom, $metricsTo] = $this->metricsPeriod($request);

        $budgetQuery = (clone $this->baseQuery($request))
            ->withCount([
                'logs as budget_contact_count' => fn ($query) => $query->where('action', 'budget_follow_up_sent'),
            ])
            ->where('service_status', OrderStatus::BUDGET_GENERATED)
            ->where('updated_at', '<=', now()->subDays($thresholdDays))
            ->orderBy('budget_follow_up_paused_at')
            ->orderBy('budget_contact_count')
            ->orderBy('updated_at');
        $budgetQuery = $this->applyResponseFilter($budgetQuery, $request, 'budget');

        $paymentQuery = (clone $this->baseQuery($request))
            ->withCount([
                'logs as payment_contact_count' => fn ($query) => $query->where('action', 'payment_reminder_sent'),
            ])
            ->whereIn('service_status', [
                OrderStatus::SERVICE_COMPLETED,
                OrderStatus::CUSTOMER_NOTIFIED,
                OrderStatus::DELIVERED,
            ])
            ->where(function ($subQuery) use ($thresholdDays) {
                $subQuery
                    ->where(function ($dateQuery) use ($thresholdDays) {
                        $dateQuery->whereNotNull('delivery_date')
                            ->where('delivery_date', '<=', now()->subDays($thresholdDays));
                    })
                    ->orWhere(function ($dateQuery) use ($thresholdDays) {
                        $dateQuery->whereNull('delivery_date')
                            ->where('updated_at', '<=', now()->subDays($thresholdDays));
                    });
            })
            ->whereRaw(
                '(COALESCE(orders.service_cost, 0) - COALESCE((SELECT SUM(op.amount) FROM order_payments op WHERE op.order_id = orders.id), 0)) > 0.009'
            )
            ->orderBy('payment_follow_up_paused_at')
            ->orderBy('payment_contact_count')
            ->orderByRaw('COALESCE(orders.delivery_date, orders.updated_at, orders.created_at)');
        $paymentQuery = $this->applyResponseFilter($paymentQuery, $request, 'payment');

        $budgetSummaryOrders = (clone $budgetQuery)
            ->get()
            ->map(fn (Order $order) => $this->appendFollowUpData($order));

        $paymentSummaryOrders = (clone $paymentQuery)
            ->get()
            ->map(fn (Order $order) => $this->appendFollowUpData($order));

        $budgetOrders = $type === 'payment'
            ? null
            : $budgetQuery
                ->paginate(10, ['*'], 'budget_page')
                ->withQueryString()
                ->through(fn (Order $order) => $this->appendFollowUpData($order));

        $paymentOrders = $type === 'budget'
            ? null
            : $paymentQuery
                ->paginate(10, ['*'], 'payment_page')
                ->withQueryString()
                ->through(fn (Order $order) => $this->appendFollowUpData($order));

        $technicians = User::query()
            ->where('tenant_id', $this->currentUser()?->tenant_id)
            ->whereIn('roles', [User::ROLE_ADMIN, User::ROLE_TECHNICIAN])
            ->where('status', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('app/follow-ups/index', [
            'filters' => [
                'search' => $request->get('search'),
                'technician_id' => $request->get('technician_id'),
                'type' => $type,
                'response_status' => $request->get('response_status', 'all'),
                'from' => $metricsFrom->toDateString(),
                'to' => $metricsTo->toDateString(),
            ],
            'summary' => [
                'budget_follow_ups' => $budgetSummaryOrders->count(),
                'payment_follow_ups' => $paymentSummaryOrders->count(),
                'threshold_days' => $thresholdDays,
                'recovery' => $this->recoverySummary($metricsFrom, $metricsTo),
                'trigger_performance' => $this->triggerPerformanceSummary($metricsFrom, $metricsTo),
                'commercial' => $this->commercialDashboard($metricsFrom, $metricsTo),
                'metrics_period' => [
                    'from' => $metricsFrom->toDateString(),
                    'to' => $metricsTo->toDateString(),
                ],
                'today_tasks' => $budgetSummaryOrders->count() + $paymentSummaryOrders->count(),
            ],
            'budgetOrders' => $budgetOrders,
            'paymentOrders' => $paymentOrders,
            'technicians' => $technicians,
            'technicianSummary' => $this->technicianSummary($budgetSummaryOrders, $paymentSummaryOrders),
            'technicianRanking' => $this->technicianRanking($metricsFrom, $metricsTo),
            'dailyAgenda' => $this->dailyAgenda($budgetSummaryOrders, $paymentSummaryOrders),
            'trends' => [
                'budget' => $this->buildTrend($this->baseLogQuery('budget_follow_up_sent', $metricsFrom, $metricsTo)->get(), $metricsFrom, $metricsTo, 'budget'),
                'payment' => $this->buildTrend($this->baseLogQuery('payment_reminder_sent', $metricsFrom, $metricsTo)->get(), $metricsFrom, $metricsTo, 'payment'),
            ],
        ]);
    }

    public function performance(Request $request)
    {
        $this->authorizeFollowUpAccess();

        [$metricsFrom, $metricsTo] = $this->metricsPeriod($request);
        $commercial = $this->commercialDashboard($metricsFrom, $metricsTo);

        return Inertia::render('app/follow-ups/performance', [
            'filters' => [
                'from' => $metricsFrom->toDateString(),
                'to' => $metricsTo->toDateString(),
            ],
            'summary' => [
                'recovery' => $this->recoverySummary($metricsFrom, $metricsTo),
                'trigger_performance' => $this->triggerPerformanceSummary($metricsFrom, $metricsTo),
                'commercial' => $commercial,
                'comparison' => $this->comparisonSummary($metricsFrom, $metricsTo),
                'targets' => [
                    'budget' => $this->targetStatus(
                        (float) ($commercial['budget']['rate'] ?? 0),
                        Other::budgetConversionTarget($this->currentUser()?->tenant_id)
                    ),
                    'payment' => $this->targetStatus(
                        (float) ($commercial['payment']['rate'] ?? 0),
                        Other::paymentRecoveryTarget($this->currentUser()?->tenant_id)
                    ),
                ],
                'metrics_period' => [
                    'from' => $metricsFrom->toDateString(),
                    'to' => $metricsTo->toDateString(),
                ],
            ],
            'technicianRanking' => $this->technicianRanking($metricsFrom, $metricsTo),
            'trends' => [
                'budget' => $this->buildTrend($this->baseLogQuery('budget_follow_up_sent', $metricsFrom, $metricsTo)->get(), $metricsFrom, $metricsTo, 'budget'),
                'payment' => $this->buildTrend($this->baseLogQuery('payment_reminder_sent', $metricsFrom, $metricsTo)->get(), $metricsFrom, $metricsTo, 'payment'),
            ],
        ]);
    }

    public function tasks(Request $request)
    {
        $this->authorizeFollowUpAccess();
        $user = $this->currentUser();

        $thresholdDays = $this->communicationThresholdDays();

        $budgetOrders = (clone $this->baseQuery($request))
            ->where('service_status', OrderStatus::BUDGET_GENERATED)
            ->where('updated_at', '<=', now()->subDays($thresholdDays))
            ->get()
            ->map(fn (Order $order) => $this->appendFollowUpData($order));

        $paymentOrders = (clone $this->baseQuery($request))
            ->whereIn('service_status', [
                OrderStatus::SERVICE_COMPLETED,
                OrderStatus::CUSTOMER_NOTIFIED,
                OrderStatus::DELIVERED,
            ])
            ->where(function ($subQuery) use ($thresholdDays) {
                $subQuery
                    ->where(function ($dateQuery) use ($thresholdDays) {
                        $dateQuery->whereNotNull('delivery_date')
                            ->where('delivery_date', '<=', now()->subDays($thresholdDays));
                    })
                    ->orWhere(function ($dateQuery) use ($thresholdDays) {
                        $dateQuery->whereNull('delivery_date')
                            ->where('updated_at', '<=', now()->subDays($thresholdDays));
                    });
            })
            ->whereRaw(
                '(COALESCE(orders.service_cost, 0) - COALESCE((SELECT SUM(op.amount) FROM order_payments op WHERE op.order_id = orders.id), 0)) > 0.009'
            )
            ->get()
            ->map(fn (Order $order) => $this->appendFollowUpData($order));

        $technicians = User::query()
            ->where('tenant_id', $this->currentUser()?->tenant_id)
            ->whereIn('roles', [User::ROLE_ADMIN, User::ROLE_OPERATOR, User::ROLE_TECHNICIAN])
            ->where('status', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        $dailyAgenda = collect($this->dailyAgenda($budgetOrders, $paymentOrders, null));
        $type = (string) $request->get('type', 'all');
        $assignedTo = (string) $request->get(
            'assigned_to',
            $user && ! $user->isRoot() && ! $user->isAdministrator()
                ? (string) $user->id
                : 'all'
        );

        if ($type !== 'all') {
            $dailyAgenda = $dailyAgenda->where('scope', $type);
        }

        if ($assignedTo === 'unassigned') {
            $dailyAgenda = $dailyAgenda->filter(fn (array $item) => empty($item['assigned_to_id']));
        } elseif ($assignedTo !== 'all') {
            $dailyAgenda = $dailyAgenda->where('assigned_to_id', (int) $assignedTo);
        }

        $dailyAgenda = $dailyAgenda->values();

        return Inertia::render('app/follow-ups/tasks', [
            'filters' => [
                'type' => $type,
                'assigned_to' => $assignedTo,
            ],
            'summary' => [
                'today_tasks' => $dailyAgenda->count(),
                'budget_tasks' => $dailyAgenda->where('scope', 'budget')->count(),
                'payment_tasks' => $dailyAgenda->where('scope', 'payment')->count(),
                'unassigned_tasks' => $dailyAgenda->filter(fn (array $item) => empty($item['assigned_to_id']))->count(),
            ],
            'dailyAgenda' => $dailyAgenda->all(),
            'technicians' => $technicians,
        ]);
    }

    public function pause(Request $request, Order $order)
    {
        $this->authorizeFollowUpAccess();
        abort_unless($this->canManageOrders(), 403);
        abort_unless($this->canAccessOrder($order), 403);

        $validated = $request->validate([
            'scope' => 'required|in:budget,payment',
            'reason' => 'required|string|max:1000',
        ]);

        $columns = $this->scopeColumns($validated['scope']);

        $order->update([
            $columns['paused_at'] => now(),
            $columns['paused_by'] => $this->currentUser()?->id,
            $columns['reason'] => trim((string) $validated['reason']),
        ]);

        $this->logOrderAction($order, $columns['log_pause'], [
            'scope' => $validated['scope'],
            'reason' => trim((string) $validated['reason']),
        ]);

        return back()->with('success', 'Automação pausada para esta ordem.');
    }

    public function resume(Request $request, Order $order)
    {
        $this->authorizeFollowUpAccess();
        abort_unless($this->canManageOrders(), 403);
        abort_unless($this->canAccessOrder($order), 403);

        $validated = $request->validate([
            'scope' => 'required|in:budget,payment',
        ]);

        $columns = $this->scopeColumns($validated['scope']);

        $order->update([
            $columns['paused_at'] => null,
            $columns['paused_by'] => null,
            $columns['reason'] => null,
        ]);

        $this->logOrderAction($order, $columns['log_resume'], [
            'scope' => $validated['scope'],
        ]);

        return back()->with('success', 'Automação reativada para esta ordem.');
    }

    public function respond(Request $request, Order $order)
    {
        $this->authorizeFollowUpAccess();
        abort_unless($this->canManageOrders(), 403);
        abort_unless($this->canAccessOrder($order), 403);

        $validated = $request->validate([
            'scope' => 'required|in:budget,payment',
            'status' => 'required|in:responded,no_interest,waiting_piece,promised_payment',
        ]);

        $columns = $this->scopeColumns($validated['scope']);
        $label = $this->responseLabel($validated['status']);

        $order->update([
            $columns['response_status'] => $validated['status'],
            $columns['response_at'] => now(),
            $columns['paused_at'] => now(),
            $columns['paused_by'] => $this->currentUser()?->id,
            $columns['reason'] => $label,
        ]);

        $this->logOrderAction($order, $columns['log_response'], [
            'scope' => $validated['scope'],
            'status' => $validated['status'],
            'label' => $label,
        ]);

        return back()->with('success', 'Retorno do cliente registrado com sucesso.');
    }

    public function completeTask(Request $request, Order $order)
    {
        $this->authorizeFollowUpAccess();
        abort_unless($this->canManageOrders(), 403);
        abort_unless($this->canAccessOrder($order), 403);

        $validated = $request->validate([
            'scope' => 'required|in:budget,payment',
            'reason' => 'required|string|max:1000',
        ]);

        $columns = $this->scopeColumns($validated['scope']);

        $order->update([
            $columns['snoozed_until'] => null,
        ]);

        $this->logOrderAction($order, $columns['log_task_completed'], [
            'scope' => $validated['scope'],
            'reason' => trim((string) $validated['reason']),
            'assigned_to' => match ($validated['scope']) {
                'budget' => $order->budgetFollowUpAssignee?->name,
                'payment' => $order->paymentFollowUpAssignee?->name,
            },
        ]);

        return back()->with('success', 'Tarefa marcada como concluída.');
    }

    public function snoozeTask(Request $request, Order $order)
    {
        $this->authorizeFollowUpAccess();
        abort_unless($this->canManageOrders(), 403);
        abort_unless($this->canAccessOrder($order), 403);

        $validated = $request->validate([
            'scope' => 'required|in:budget,payment',
            'days' => 'required|integer|min:1|max:30',
        ]);

        $columns = $this->scopeColumns($validated['scope']);
        $snoozedUntil = now()->addDays((int) $validated['days'])->endOfDay();

        $order->update([
            $columns['snoozed_until'] => $snoozedUntil,
        ]);

        $this->logOrderAction($order, $columns['log_task_snoozed'], [
            'scope' => $validated['scope'],
            'days' => (int) $validated['days'],
            'snoozed_until' => $snoozedUntil->toIso8601String(),
        ]);

        return back()->with('success', 'Tarefa adiada com sucesso.');
    }

    public function assignTask(Request $request, Order $order)
    {
        $this->authorizeFollowUpAccess();
        abort_unless($this->canManageOrders(), 403);
        abort_unless($this->canAccessOrder($order), 403);

        $validated = $request->validate([
            'scope' => 'required|in:budget,payment',
            'user_id' => 'nullable|integer|exists:users,id',
        ]);

        $assignee = null;

        if (! empty($validated['user_id'])) {
            $assignee = User::query()
                ->where('tenant_id', $this->currentUser()?->tenant_id)
                ->where('id', $validated['user_id'])
                ->where('status', 1)
                ->firstOrFail();
        }

        $columns = $this->scopeColumns($validated['scope']);

        $order->update([
            $columns['assigned_to'] => $assignee?->id,
        ]);

        $this->logOrderAction($order, $columns['log_task_assigned'], [
            'scope' => $validated['scope'],
            'assigned_to' => $assignee?->name,
        ]);

        return back()->with('success', 'Responsável da tarefa atualizado.');
    }
}
