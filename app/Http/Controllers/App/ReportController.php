<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Customer;
use App\Models\App\CashSession;
use App\Models\App\Expense;
use App\Models\App\Order;
use App\Models\App\Other;
use App\Models\App\Part;
use App\Models\App\Sale;
use App\Models\App\Schedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ReportController extends Controller
{
    private function buildWarrantyReturnMeta(iterable $orders): array
    {
        $collection = collect($orders);
        $totalOrders = $collection->count();
        $warrantyReturns = $collection->where('is_warranty_return', true)->count();
        $threshold = Other::warrantyReturnAlertThreshold();
        $rate = $totalOrders > 0 ? round(($warrantyReturns / $totalOrders) * 100, 1) : 0.0;

        return [
            'warranty_return_threshold' => $threshold,
            'warranty_return_rate' => $rate,
            'warranty_return_alert' => $rate > $threshold,
            'warranty_returns' => $warrantyReturns,
        ];
    }

    private function canUseSalesReports(): bool
    {
        $user = Auth::user();
        $otherSetting = Other::query()->first();

        return (bool) ($user?->hasPermission('sales') && $otherSetting?->enablesales);
    }

    private function severityForRate(float $rate, float $threshold): string
    {
        if ($rate <= 5) {
            return 'Saudável';
        }

        if ($rate <= $threshold) {
            return 'Atenção';
        }

        return 'Crítico';
    }

    public function index(Request $request)
    {
        Gate::authorize('reports.view');

        return Inertia::render('app/reports/index');
    }

    public function store(Request $request)
    {
        Gate::authorize('reports.view');

        $type = $request->input('type');
        $from = Carbon::parse($request->input('from'))->startOfDay();
        $to = Carbon::parse($request->input('to'))->endOfDay();
        $reportMeta = [];

        switch ($type) {
            case 'orders':
                $data = Order::with(['customer', 'equipment', 'user'])
                    ->whereBetween('created_at', [$from, $to])
                    ->orderBy('created_at', 'desc')
                    ->get();
                $reportMeta = [
                    ...$reportMeta,
                    ...$this->buildWarrantyReturnMeta($data),
                ];
                break;

            case 'customers':
                $data = Customer::whereBetween('created_at', [$from, $to])->get();
                break;

            case 'schedules':
                $data = Schedule::with(['customer', 'user'])
                    ->whereBetween('created_at', [$from, $to])
                    ->get();
                break;

            case 'sales':
                if (! $this->canUseSalesReports()) {
                    abort(403, 'Relatórios de vendas estão desabilitados.');
                }

                $data = Sale::with('customer')
                    ->withCount('items')
                    ->whereBetween('created_at', [$from, $to])
                    ->get();

                $reportMeta['expenses_total'] = (float) Expense::query()
                    ->whereBetween('expense_date', [$from->toDateString(), $to->toDateString()])
                    ->sum('amount');
                break;

            case 'parts':
                $data = Part::query()
                    ->withCount('part_movements')
                    ->whereBetween('created_at', [$from, $to])
                    ->orderBy('name')
                    ->get();
                break;

            case 'cashier':
                if (! $this->canUseSalesReports()) {
                    abort(403, 'Relatórios de caixa estão desabilitados.');
                }

                $data = CashSession::query()
                    ->with([
                        'openedBy:id,name',
                        'closedBy:id,name',
                        'sales:id,cash_session_id,total_amount,payment_method,status',
                        'orderPayments:id,cash_session_id,amount,payment_method',
                    ])
                    ->where('status', 'closed')
                    ->whereBetween('closed_at', [$from, $to])
                    ->orderByDesc('closed_at')
                    ->get();

                $reportMeta['sessions_count'] = $data->count();
                $reportMeta['opening_total'] = (float) $data->sum('opening_balance');
                $reportMeta['completed_sales_total'] = (float) $data->sum('total_completed_sales');
                $reportMeta['order_payments_total'] = (float) $data->sum('total_order_payments');
                $reportMeta['manual_entries_total'] = (float) $data->sum('manual_entries');
                $reportMeta['manual_exits_total'] = (float) $data->sum('manual_exits');
                $reportMeta['expected_total'] = (float) $data->sum('expected_balance');
                $reportMeta['closing_total'] = (float) $data->sum('closing_balance');
                $reportMeta['difference_total'] = (float) $data->sum('difference');
                $reportMeta['sales_by_method'] = [
                    'pix' => 0.0,
                    'cartao' => 0.0,
                    'dinheiro' => 0.0,
                    'transferencia' => 0.0,
                    'boleto' => 0.0,
                ];
                $reportMeta['order_payments_by_method'] = [
                    'pix' => 0.0,
                    'cartao' => 0.0,
                    'dinheiro' => 0.0,
                    'transferencia' => 0.0,
                    'boleto' => 0.0,
                ];

                foreach ($data as $session) {
                    foreach (($session->sales ?? collect()) as $sale) {
                        if (($sale->status ?? null) !== 'completed') {
                            continue;
                        }
                        $method = strtolower((string) ($sale->payment_method ?? ''));
                        if (array_key_exists($method, $reportMeta['sales_by_method'])) {
                            $reportMeta['sales_by_method'][$method] += (float) ($sale->total_amount ?? 0);
                        }
                    }

                    foreach (($session->orderPayments ?? collect()) as $payment) {
                        $method = strtolower((string) ($payment->payment_method ?? ''));
                        if (array_key_exists($method, $reportMeta['order_payments_by_method'])) {
                            $reportMeta['order_payments_by_method'][$method] += (float) ($payment->amount ?? 0);
                        }
                    }
                }
                break;

            case 'quality':
                $data = Order::query()
                    ->with([
                        'equipment:id,equipment',
                        'user:id,name',
                        'customer:id,name',
                        'customerFeedbackRecoveryAssignee:id,name',
                    ])
                    ->whereBetween('created_at', [$from, $to])
                    ->orderByDesc('created_at')
                    ->get();

                $threshold = Other::warrantyReturnAlertThreshold();
                $warrantyOrders = $data->where('is_warranty_return', true)->values();
                $deliveredOrders = $data->where('service_status', \App\Support\OrderStatus::DELIVERED)->values();
                $feedbackResponses = $deliveredOrders->filter(fn ($order) => ! is_null($order->customer_feedback_submitted_at))->values();
                $lowFeedbackOrders = $feedbackResponses
                    ->filter(fn ($order) => (int) ($order->customer_feedback_rating ?? 0) <= 3)
                    ->sortBy('customer_feedback_rating')
                    ->values();

                $totalOrders = $data->count();
                $warrantyReturns = $warrantyOrders->count();
                $warrantyRate = $totalOrders > 0 ? round(($warrantyReturns / $totalOrders) * 100, 1) : 0.0;
                $feedbackAverageRating = round((float) ($feedbackResponses->avg('customer_feedback_rating') ?? 0), 1);
                $feedbackResponseRate = $deliveredOrders->count() > 0
                    ? round(($feedbackResponses->count() / $deliveredOrders->count()) * 100, 1)
                    : 0.0;

                $reportMeta = [
                    'summary' => [
                        'total_orders' => $totalOrders,
                        'warranty_returns' => $warrantyReturns,
                        'warranty_return_rate' => $warrantyRate,
                        'warranty_return_threshold' => $threshold,
                        'severity' => $this->severityForRate($warrantyRate, $threshold),
                        'feedback_responses' => $feedbackResponses->count(),
                        'feedback_average_rating' => $feedbackAverageRating,
                        'feedback_response_rate' => $feedbackResponseRate,
                        'low_feedbacks' => $lowFeedbackOrders->count(),
                        'recovery_pending' => $lowFeedbackOrders->filter(
                            fn ($order) => ($order->customer_feedback_recovery_status ?: 'pending') === 'pending'
                        )->count(),
                        'recovery_in_progress' => $lowFeedbackOrders->filter(
                            fn ($order) => ($order->customer_feedback_recovery_status ?: 'pending') === 'in_progress'
                        )->count(),
                        'recovery_resolved' => $lowFeedbackOrders->filter(
                            fn ($order) => ($order->customer_feedback_recovery_status ?: 'pending') === 'resolved'
                        )->count(),
                    ],
                    'top_equipments' => $warrantyOrders
                        ->groupBy(fn ($order) => $order->equipment?->equipment ?: 'Equipamento não informado')
                        ->map(fn ($items, $label) => ['label' => $label, 'total' => $items->count()])
                        ->sortByDesc('total')
                        ->values()
                        ->take(5)
                        ->all(),
                    'top_defects' => $warrantyOrders
                        ->groupBy(fn ($order) => trim((string) ($order->defect ?: 'Defeito não informado')) ?: 'Defeito não informado')
                        ->map(fn ($items, $label) => ['label' => $label, 'total' => $items->count()])
                        ->sortByDesc('total')
                        ->values()
                        ->take(5)
                        ->all(),
                    'top_technicians' => $warrantyOrders
                        ->groupBy(fn ($order) => $order->user?->name ?: 'Não definido')
                        ->map(fn ($items, $label) => ['label' => $label, 'total' => $items->count()])
                        ->sortByDesc('total')
                        ->values()
                        ->take(5)
                        ->all(),
                    'low_feedback_orders' => $lowFeedbackOrders
                        ->take(8)
                        ->map(fn ($order) => [
                            'id' => $order->id,
                            'order_number' => $order->order_number,
                            'customer' => $order->customer?->name ?: 'Cliente não informado',
                            'rating' => (int) ($order->customer_feedback_rating ?? 0),
                            'comment' => $order->customer_feedback_comment,
                            'submitted_at' => $order->customer_feedback_submitted_at?->toIso8601String(),
                            'recovery_status' => $order->customer_feedback_recovery_status ?: 'pending',
                            'recovery_assigned_to' => $order->customerFeedbackRecoveryAssignee?->name,
                        ])
                        ->all(),
                ];
                break;

            case 'expenses':
                if (! $this->canUseSalesReports()) {
                    abort(403, 'Relatórios de despesas estão desabilitados.');
                }

                $data = Expense::with('createdBy:id,name')
                    ->whereBetween('expense_date', [$from->toDateString(), $to->toDateString()])
                    ->orderByDesc('expense_date')
                    ->orderByDesc('expense_number')
                    ->get();
                break;

            default:
                $data = collect();
        }

        return Inertia::render('app/reports/index', [
            'reportData' => $data,
            'reportMeta' => $reportMeta,
            'type' => $type,
        ]);
    }
}
