<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Order;
use App\Models\App\Other;
use App\Support\OrderStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QualityIndicatorController extends Controller
{
    private function authorizeQualityAccess(): void
    {
        abort_unless(Auth::user()?->hasPermission('reports'), 403);
    }

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

    private function buildMetrics(Carbon $start, Carbon $end): array
    {
        $threshold = Other::warrantyReturnAlertThreshold();
        $allOrders = Order::query()
            ->with(['equipment:id,equipment', 'user:id,name', 'warrantySourceOrder:id,delivery_date'])
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
            ],
            'top_equipments' => $topEquipments,
            'top_defects' => $topDefects,
            'top_technicians' => $topTechnicians,
            'status_breakdown' => $statusBreakdown,
            'trend' => $this->buildTrend($allOrders, $start, $end, $threshold),
            'comparison' => $this->buildComparison($start, $end, $rate),
        ];
    }

    public function index()
    {
        $this->authorizeQualityAccess();

        return Inertia::render('app/quality/index');
    }

    public function metrics(Request $request, $timerange)
    {
        $this->authorizeQualityAccess();

        [$start, $end] = $this->getRange($timerange);

        return response()->json($this->buildMetrics($start, $end));
    }
}
