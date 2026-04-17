<?php

namespace App\Http\Controllers\App;

use App\Events\OrderFeedbackRecoveryUpdated;
use App\Http\Controllers\Controller;
use App\Models\App\Order;
use App\Models\App\Other;
use App\Support\OrderStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use App\Models\User;

class QualityIndicatorController extends Controller
{
    private const FEEDBACK_RECOVERY_SLA_DAYS = 3;
    private const FEEDBACK_RECOVERY_STATUSES = [
        'pending',
        'in_progress',
        'resolved',
    ];

    private function getRange($timerange): array
    {
        $from = request()->query('from');
        $to = request()->query('to');

        if ($from && $to) {
            try {
                $start = Carbon::parse($from)->startOfDay();
                $end = Carbon::parse($to)->endOfDay();

                if ($start->gt($end)) {
                    [$start, $end] = [$end, $start];
                }

                return [$start, $end];
            } catch (\Throwable $e) {
                // fallback para range padrao
            }
        }

        $timerange = intval($timerange) > 0 ? intval($timerange) : 7;
        $start = Carbon::now()->subDays($timerange - 1)->startOfDay();
        $end = Carbon::now()->endOfDay();

        return [$start, $end];
    }

    private function severityForRate(float $rate, float $threshold): string
    {
        if ($rate <= 5) {
            return 'Saudavel';
        }

        if ($rate <= $threshold) {
            return 'Atencao';
        }

        return 'Critico';
    }

    private function buildTrend(Collection $orders, Carbon $start, Carbon $end, float $threshold): array
    {
        $days = max(1, $start->diffInDays($end) + 1);
        $granularity = $days <= 14 ? 'daily' : ($days <= 90 ? 'weekly' : 'monthly');
        $buckets = [];

        if ($granularity === 'daily') {
            for ($cursor = $start->copy(); $cursor->lte($end); $cursor->addDay()) {
                $bucketStart = $cursor->copy()->startOfDay();
                $bucketEnd = $cursor->copy()->endOfDay();
                $label = $cursor->format('d/m');

                $bucketOrders = $orders->filter(fn (Order $order) => Carbon::parse($order->created_at)->between($bucketStart, $bucketEnd));
                $totalOrders = $bucketOrders->count();
                $returns = $bucketOrders->where('is_warranty_return', true)->count();
                $rate = $totalOrders > 0 ? round(($returns / $totalOrders) * 100, 1) : 0.0;

                $buckets[] = [
                    'label' => $label,
                    'rate' => $rate,
                    'returns' => $returns,
                    'total_orders' => $totalOrders,
                    'severity' => $this->severityForRate($rate, $threshold),
                ];
            }

            return ['granularity' => $granularity, 'data' => $buckets];
        }

        if ($granularity === 'weekly') {
            for ($cursor = $start->copy()->startOfWeek(); $cursor->lte($end); $cursor->addWeek()) {
                $bucketStart = $cursor->copy()->max($start);
                $bucketEnd = $cursor->copy()->endOfWeek()->min($end);
                $label = $bucketStart->format('d/m') . ' - ' . $bucketEnd->format('d/m');

                $bucketOrders = $orders->filter(fn (Order $order) => Carbon::parse($order->created_at)->between($bucketStart, $bucketEnd));
                $totalOrders = $bucketOrders->count();
                $returns = $bucketOrders->where('is_warranty_return', true)->count();
                $rate = $totalOrders > 0 ? round(($returns / $totalOrders) * 100, 1) : 0.0;

                $buckets[] = [
                    'label' => $label,
                    'rate' => $rate,
                    'returns' => $returns,
                    'total_orders' => $totalOrders,
                    'severity' => $this->severityForRate($rate, $threshold),
                ];
            }

            return ['granularity' => $granularity, 'data' => $buckets];
        }

        for ($cursor = $start->copy()->startOfMonth(); $cursor->lte($end); $cursor->addMonth()) {
            $bucketStart = $cursor->copy()->max($start);
            $bucketEnd = $cursor->copy()->endOfMonth()->min($end);
            $label = $cursor->translatedFormat('M/Y');

            $bucketOrders = $orders->filter(fn (Order $order) => Carbon::parse($order->created_at)->between($bucketStart, $bucketEnd));
            $totalOrders = $bucketOrders->count();
            $returns = $bucketOrders->where('is_warranty_return', true)->count();
            $rate = $totalOrders > 0 ? round(($returns / $totalOrders) * 100, 1) : 0.0;

            $buckets[] = [
                'label' => $label,
                'rate' => $rate,
                'returns' => $returns,
                'total_orders' => $totalOrders,
                'severity' => $this->severityForRate($rate, $threshold),
            ];
        }

        return ['granularity' => $granularity, 'data' => $buckets];
    }

    private function buildComparison(Carbon $start, Carbon $end, float $currentRate): array
    {
        $days = max(1, $start->diffInDays($end) + 1);
        $previousEnd = $start->copy()->subDay()->endOfDay();
        $previousStart = $previousEnd->copy()->subDays($days - 1)->startOfDay();

        $previousOrders = Order::query()
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->get();

        $previousTotal = $previousOrders->count();
        $previousReturns = $previousOrders->where('is_warranty_return', true)->count();
        $previousRate = $previousTotal > 0 ? round(($previousReturns / $previousTotal) * 100, 1) : 0.0;
        $delta = round($currentRate - $previousRate, 1);

        return [
            'period' => [
                'from' => $previousStart->toDateString(),
                'to' => $previousEnd->toDateString(),
            ],
            'previous_total_orders' => $previousTotal,
            'previous_warranty_returns' => $previousReturns,
            'previous_warranty_return_rate' => $previousRate,
            'delta_rate' => $delta,
            'direction' => $delta < 0 ? 'melhorou' : ($delta > 0 ? 'piorou' : 'estavel'),
        ];
    }

    private function buildMetrics(Carbon $start, Carbon $end, ?string $recoveryStatus = null, ?string $assignedTo = null): array
    {
        $threshold = Other::warrantyReturnAlertThreshold();
        $allOrders = Order::query()
            ->with([
                'equipment:id,equipment',
                'user:id,name',
                'warrantySourceOrder:id,delivery_date',
                'customer:id,name',
                'customerFeedbackRecoveryAssignee:id,name',
            ])
            ->whereBetween('created_at', [$start, $end])
            ->get();

        $warrantyOrders = $allOrders->where('is_warranty_return', true)->values();
        $totalOrders = $allOrders->count();
        $warrantyReturns = $warrantyOrders->count();
        $rate = $totalOrders > 0 ? round(($warrantyReturns / $totalOrders) * 100, 1) : 0.0;
        $severity = $this->severityForRate($rate, $threshold);

        $openWarrantyReturns = $warrantyOrders
            ->whereNotIn('service_status', [
                OrderStatus::CANCELLED,
                OrderStatus::SERVICE_NOT_EXECUTED,
                OrderStatus::DELIVERED,
            ])
            ->count();

        $avgDaysToReturn = round(
            $warrantyOrders
                ->filter(fn (Order $order) => $order->warrantySourceOrder?->delivery_date)
                ->map(function (Order $order) {
                    return Carbon::parse($order->created_at)->diffInDays(
                        Carbon::parse($order->warrantySourceOrder?->delivery_date)
                    );
                })
                ->avg() ?? 0,
            1
        );

        $topEquipments = $warrantyOrders
            ->groupBy(fn (Order $order) => $order->equipment?->equipment ?: 'Equipamento nao informado')
            ->map(fn ($items, $label) => ['label' => $label, 'total' => $items->count()])
            ->sortByDesc('total')
            ->values()
            ->take(5)
            ->all();

        $topDefects = $warrantyOrders
            ->groupBy(fn (Order $order) => trim((string) ($order->defect ?: 'Defeito nao informado')) ?: 'Defeito nao informado')
            ->map(fn ($items, $label) => ['label' => $label, 'total' => $items->count()])
            ->sortByDesc('total')
            ->values()
            ->take(5)
            ->all();

        $topTechnicians = $warrantyOrders
            ->groupBy(fn (Order $order) => $order->user?->name ?: 'Nao definido')
            ->map(fn ($items, $label) => ['label' => $label, 'total' => $items->count()])
            ->sortByDesc('total')
            ->values()
            ->take(5)
            ->all();

        $statusBreakdown = $warrantyOrders
            ->groupBy('service_status')
            ->map(fn ($items, $status) => [
                'status' => (int) $status,
                'label' => OrderStatus::label((int) $status),
                'total' => $items->count(),
            ])
            ->sortByDesc('total')
            ->values()
            ->all();

        $deliveredOrders = $allOrders->where('service_status', OrderStatus::DELIVERED);
        $feedbackResponses = $deliveredOrders->filter(fn (Order $order) => ! is_null($order->customer_feedback_submitted_at));
        $feedbackAverageRating = round((float) ($feedbackResponses->avg('customer_feedback_rating') ?? 0), 1);
        $feedbackResponseRate = $deliveredOrders->count() > 0
            ? round(($feedbackResponses->count() / $deliveredOrders->count()) * 100, 1)
            : 0.0;
        $lowFeedbackOrders = $feedbackResponses
            ->filter(fn (Order $order) => (int) ($order->customer_feedback_rating ?? 0) <= 3)
            ->sortBy('customer_feedback_rating')
            ->values();
        $allLowFeedbackOrders = $lowFeedbackOrders;
        $overdueLowFeedbackOrders = $allLowFeedbackOrders
            ->filter(function (Order $order) {
                if (($order->customer_feedback_recovery_status ?: 'pending') === 'resolved') {
                    return false;
                }

                return $order->customer_feedback_submitted_at?->lte(now()->subDays(self::FEEDBACK_RECOVERY_SLA_DAYS)) ?? false;
            })
            ->values();

        if ($recoveryStatus && in_array($recoveryStatus, self::FEEDBACK_RECOVERY_STATUSES, true)) {
            $lowFeedbackOrders = $lowFeedbackOrders
                ->filter(fn (Order $order) => ($order->customer_feedback_recovery_status ?: 'pending') === $recoveryStatus)
                ->values();
        }

        if ($assignedTo === 'unassigned') {
            $lowFeedbackOrders = $lowFeedbackOrders
                ->filter(fn (Order $order) => empty($order->customer_feedback_recovery_assigned_to))
                ->values();
        } elseif ($assignedTo && is_numeric($assignedTo)) {
            $lowFeedbackOrders = $lowFeedbackOrders
                ->filter(fn (Order $order) => (int) $order->customer_feedback_recovery_assigned_to === (int) $assignedTo)
                ->values();
        }

        return [
            'period' => [
                'from' => $start->toDateString(),
                'to' => $end->toDateString(),
            ],
            'summary' => [
                'total_orders' => $totalOrders,
                'warranty_returns' => $warrantyReturns,
                'warranty_return_rate' => $rate,
                'warranty_return_threshold' => $threshold,
                'warranty_return_alert' => $rate > $threshold,
                'severity' => $severity,
                'open_warranty_returns' => $openWarrantyReturns,
                'affected_customers' => $warrantyOrders->pluck('customer_id')->filter()->unique()->count(),
                'avg_days_to_return' => $avgDaysToReturn,
                'feedback_responses' => $feedbackResponses->count(),
                'feedback_average_rating' => $feedbackAverageRating,
                'feedback_response_rate' => $feedbackResponseRate,
                'low_feedbacks' => $allLowFeedbackOrders->count(),
                'unassigned_low_feedbacks' => $allLowFeedbackOrders->filter(fn (Order $order) => empty($order->customer_feedback_recovery_assigned_to))->count(),
                'recovery_pending' => $allLowFeedbackOrders->filter(fn (Order $order) => ($order->customer_feedback_recovery_status ?: 'pending') === 'pending')->count(),
                'recovery_in_progress' => $allLowFeedbackOrders->filter(fn (Order $order) => ($order->customer_feedback_recovery_status ?: 'pending') === 'in_progress')->count(),
                'recovery_resolved' => $allLowFeedbackOrders->filter(fn (Order $order) => ($order->customer_feedback_recovery_status ?: 'pending') === 'resolved')->count(),
                'recovery_overdue' => $overdueLowFeedbackOrders->count(),
                'recovery_sla_days' => self::FEEDBACK_RECOVERY_SLA_DAYS,
            ],
            'top_equipments' => $topEquipments,
            'top_defects' => $topDefects,
            'top_technicians' => $topTechnicians,
            'status_breakdown' => $statusBreakdown,
            'low_feedback_orders' => $lowFeedbackOrders->map(fn (Order $order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer' => $order->customer?->name ?: 'Cliente não informado',
                'rating' => (int) ($order->customer_feedback_rating ?? 0),
                'comment' => $order->customer_feedback_comment,
                'submitted_at' => $order->customer_feedback_submitted_at?->toIso8601String(),
                'recovery_status' => $order->customer_feedback_recovery_status ?: 'pending',
                'recovery_notes' => $order->customer_feedback_recovery_notes,
                'recovery_updated_at' => $order->customer_feedback_recovery_updated_at?->toIso8601String(),
                'recovery_assigned_to' => $order->customerFeedbackRecoveryAssignee?->name,
                'recovery_assigned_to_id' => $order->customer_feedback_recovery_assigned_to,
                'recovery_overdue' => $order->customer_feedback_submitted_at?->lte(now()->subDays(self::FEEDBACK_RECOVERY_SLA_DAYS))
                    && (($order->customer_feedback_recovery_status ?: 'pending') !== 'resolved'),
            ])->all(),
            'trend' => $this->buildTrend($allOrders, $start, $end, $threshold),
            'comparison' => $this->buildComparison($start, $end, $rate),
        ];
    }

    public function index()
    {
        Gate::authorize('quality.view');

        return Inertia::render('app/quality/index', [
            'recoveryAssignees' => User::query()
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function metrics(Request $request, $timerange)
    {
        Gate::authorize('quality.view');

        [$start, $end] = $this->getRange($timerange);
        $recoveryStatus = $request->query('recovery_status');
        $assignedTo = $request->query('assigned_to');

        return response()->json($this->buildMetrics($start, $end, $recoveryStatus, $assignedTo));
    }

    public function updateFeedbackRecovery(Request $request, Order $order)
    {
        Gate::authorize('quality.manage');

        $validated = $request->validate([
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['required', 'string', 'in:' . implode(',', self::FEEDBACK_RECOVERY_STATUSES)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        abort_unless(
            ! is_null($order->customer_feedback_submitted_at) && (int) ($order->customer_feedback_rating ?? 0) <= 3,
            422
        );

        $order->update([
            'customer_feedback_recovery_assigned_to' => $validated['assigned_to'] ?? null,
            'customer_feedback_recovery_status' => $validated['status'],
            'customer_feedback_recovery_notes' => $validated['notes'] ?? null,
            'customer_feedback_recovery_updated_at' => now(),
        ]);

        $assignee = null;
        if (! empty($validated['assigned_to'])) {
            $assignee = User::query()->find($validated['assigned_to']);
        }

        event(new OrderFeedbackRecoveryUpdated($order->id, Auth::id(), [
            'status' => $validated['status'],
            'assigned_to' => $assignee?->name,
            'assigned_to_id' => $assignee?->id,
            'notes' => $validated['notes'] ?? null,
        ]));

        return back()->with('success', 'Tratativa da avaliação atualizada com sucesso.');
    }
}
