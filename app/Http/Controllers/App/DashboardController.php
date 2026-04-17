<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Customer;
use App\Models\App\CashSession;
use App\Models\App\Equipment;
use App\Models\App\Expense;
use App\Models\App\Message;
use App\Models\App\Order;
use App\Models\App\Other;
use App\Models\App\Part;
use App\Models\App\Sale;
use App\Models\App\Schedule;
use App\Support\OrderStatus;
use App\Models\User;
use Carbon\CarbonPeriod;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private function warrantyReturnIndicator(int $totalOrders, int $warrantyReturns): array
    {
        $threshold = Other::warrantyReturnAlertThreshold();
        $rate = $totalOrders > 0 ? round(($warrantyReturns / $totalOrders) * 100, 1) : 0.0;

        return [
            'warranty_return_threshold' => $threshold,
            'warranty_return_rate' => $rate,
            'warranty_return_alert' => $rate > $threshold,
        ];
    }

    public function index()
    {
        $feedbackDelay = Other::customerFeedbackRequestDelayDays(auth()->user()?->tenant_id);
        $feedbackThreshold = Carbon::now()->subDays($feedbackDelay)->endOfDay();
        $today = Carbon::today();
        $tomorrow = Carbon::tomorrow();

        $pendingOrdersQuery = Order::query()
            ->whereNotNull('delivery_forecast')
            ->whereNotIn('service_status', [OrderStatus::CANCELLED, OrderStatus::SERVICE_NOT_EXECUTED, OrderStatus::DELIVERED]);

        $acount = [
            'numuser' => User::count(),
            'numcust' => Customer::count(),
            'numorde' => Order::count(),
            'numorde_warranty_return' => Order::where('is_warranty_return', true)->count(),
            'numorde_due_today' => (clone $pendingOrdersQuery)->whereDate('delivery_forecast', $today)->count(),
            'numorde_due_tomorrow' => (clone $pendingOrdersQuery)->whereDate('delivery_forecast', $tomorrow)->count(),
            'numshed' => Schedule::count(),
            'nummess' => Message::count(),
            'numparts' => Part::where('type', 'part')->count(),
            'numproducts' => Part::where('type', 'product')->count(),
        ];
        $orders = [
            'agendados' => Schedule::where('status', 1)->get('schedules_number'),
            'gerados' => Order::where('service_status', OrderStatus::BUDGET_GENERATED)->get('order_number'),
            'aprovados' => Order::where('service_status', OrderStatus::BUDGET_APPROVED)->get('order_number'),
            'concluidosca' => Order::where('service_status', OrderStatus::CUSTOMER_NOTIFIED)->get('order_number'),
            'concluidoscn' => Order::where('service_status', OrderStatus::SERVICE_COMPLETED)->get('order_number'),
            'garantia' => Order::where('is_warranty_return', true)->get(['id', 'order_number']),
            'feedback' => Order::where('service_status', OrderStatus::DELIVERED)
                ->whereNotNull('delivery_date')
                ->where('delivery_date', '<=', $feedbackThreshold)
                ->whereNull('customer_feedback_submitted_at')
                ->get('order_number'),
        ];
        $listSchedules= Schedule::with('user', 'customer')->get();
        $parts = Part::where('is_sellable', true)->get();
        $customers = Customer::get();
        $others = Other::query()
            ->where('tenant_id', auth()->user()?->tenant_id)
            ->first();
        $openCashSession = CashSession::query()
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        return Inertia::render('app/dashboard/index', [
            'listSchedules' => $listSchedules,
            'reloadKey' => now()->timestamp,
            'orders' => $orders,
            'acount' => $acount,
            'parts' => $parts,
            'customers' => $customers,
            'others' => $others,
            'cashier' => [
                'isOpen' => (bool) $openCashSession,
                'openedAt' => $openCashSession?->opened_at?->toIso8601String(),
            ],
            'warrantyIndicator' => $this->warrantyReturnIndicator(
                (int) $acount['numorde'],
                (int) $acount['numorde_warranty_return']
            ),
        ]);
    }

    private function getRange($timerange)
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
            } catch (\Exception $e) {
                // fallback para range baseado em $timerange
            }
        }

        $timerange = intval($timerange) > 0 ? intval($timerange) : 7;
        $start = Carbon::now()->subDays($timerange - 1)->startOfDay();
        $end = Carbon::now()->endOfDay();

        return [$start, $end];
    }

    public function chartEquipments($timerange)
    {
        [$start, $end] = $this->getRange($timerange);

        $equipments = Equipment::where('chart', 1)
            ->get();

        $selects = [
            DB::raw('DATE(created_at) as date'),
        ];

        foreach ($equipments as $equipment) {
            $selects[] = DB::raw(
                "SUM(CASE WHEN equipment_id = {$equipment->id} THEN 1 ELSE 0 END) as eq_{$equipment->id}"
            );
        }

        $orders = Order::select($selects)
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $result = [];

        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {

            $key = $date->format('Y-m-d');

            $row = [
                'date' => $date->format('Y-m-d'),
            ];

            foreach ($equipments as $equipment) {

                $field = "eq_{$equipment->id}";

                $row[$field] = $orders[$key]->$field ?? 0;
            }

            $result[] = $row;
        }

        return response()->json([
            'lines' => $equipments->map(fn ($e) => [
                'key' => "eq_{$e->id}",
                'label' => $e->equipment,
            ]),
            'data' => $result,
        ]);
    }

    public function fluxsOrders($timerange)
    {
        [$start, $end] = $this->getRange($timerange);

        $orders = Order::selectRaw('
            DATE(created_at) as date,
            COUNT(*) as entradas,
            SUM(CASE WHEN service_status IN (7,9) THEN 1 ELSE 0 END) as concluidos,
            SUM(CASE WHEN service_status = 10 THEN 1 ELSE 0 END) as entregues
        ')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $result = [];

        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {

            $key = $date->format('Y-m-d');
            $data = $orders->get($key);

            $result[] = [
                'period' => $date->format('Y-m-d'),
                'entradas' => $data->entradas ?? 0,
                'concluidos' => $data->concluidos ?? 0,
                'entregues' => $data->entregues ?? 0,
            ];
        }

        return response()->json($result);
    }

    public function budgetsStatusChart($timerange)
    {
        [$start, $end] = $this->getRange($timerange);

        $generated = Order::query()
            ->where('service_status', OrderStatus::BUDGET_GENERATED)
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $approved = Order::query()
            ->where('service_status', OrderStatus::BUDGET_APPROVED)
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $approvalRate = $generated > 0 ? round(min(100, ($approved / $generated) * 100), 1) : 0;

        return response()->json([
            'generated' => $generated,
            'approved' => $approved,
            'total' => $generated,
            'approval_rate' => $approvalRate,
        ]);
    }

    public function metricsSystem($timerange)
    {
        [$startDate, $endDate] = $this->getRange($timerange);

        $ordersCount = Order::whereBetween('created_at', [$startDate, $endDate])->count();
        $warrantyReturns = Order::where('is_warranty_return', true)->whereBetween('created_at', [$startDate, $endDate])->count();
        $deliveredOrders = Order::where('service_status', OrderStatus::DELIVERED)
            ->whereBetween('created_at', [$startDate, $endDate]);
        $feedbackResponses = (clone $deliveredOrders)
            ->whereNotNull('customer_feedback_submitted_at')
            ->count();
        $feedbackAverageRating = round(
            (float) ((clone $deliveredOrders)
                ->whereNotNull('customer_feedback_submitted_at')
                ->avg('customer_feedback_rating') ?? 0),
            1
        );
        $lowFeedbackCount = (clone $deliveredOrders)
            ->whereNotNull('customer_feedback_submitted_at')
            ->where('customer_feedback_rating', '<=', 3)
            ->count();
        $feedbackResponseRate = (clone $deliveredOrders)->count() > 0
            ? round(($feedbackResponses / (clone $deliveredOrders)->count()) * 100, 1)
            : 0.0;
        $communicationThreshold = now()->subDays(2);

        $budgetFollowUps = Order::query()
            ->where('service_status', OrderStatus::BUDGET_GENERATED)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('updated_at', '<=', $communicationThreshold)
            ->count();

        $pendingPaymentFollowUps = Order::query()
            ->whereIn('service_status', [
                OrderStatus::SERVICE_COMPLETED,
                OrderStatus::CUSTOMER_NOTIFIED,
                OrderStatus::DELIVERED,
            ])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where(function ($query) use ($communicationThreshold) {
                $query
                    ->where(function ($dateQuery) use ($communicationThreshold) {
                        $dateQuery->whereNotNull('delivery_date')
                            ->where('delivery_date', '<=', $communicationThreshold);
                    })
                    ->orWhere(function ($dateQuery) use ($communicationThreshold) {
                        $dateQuery->whereNull('delivery_date')
                            ->where('updated_at', '<=', $communicationThreshold);
                    });
            })
            ->whereRaw(
                '(COALESCE(orders.service_cost, 0) - COALESCE((SELECT SUM(op.amount) FROM order_payments op WHERE op.order_id = orders.id), 0)) > 0.009'
            )
            ->count();

        return response()->json([

            'customers' => Customer::whereBetween('created_at', [$startDate, $endDate])->count(),

            'orders' => $ordersCount,

            'schedules' => Schedule::whereBetween('created_at', [$startDate, $endDate])->count(),

            'messages' => Message::whereBetween('created_at', [$startDate, $endDate])->count(),

            'parts' => Part::where('type', 'part')->whereBetween('created_at', [$startDate, $endDate])->count(),

            'products' => Part::where('type', 'product')->whereBetween('created_at', [$startDate, $endDate])->count(),

            'warranty_returns' => $warrantyReturns,
            'feedback_responses' => $feedbackResponses,
            'feedback_average_rating' => $feedbackAverageRating,
            'feedback_response_rate' => $feedbackResponseRate,
            'low_feedbacks' => $lowFeedbackCount,
            'feedback_alert' => $lowFeedbackCount > 0,
            'budget_follow_ups' => $budgetFollowUps,
            'pending_payment_follow_ups' => $pendingPaymentFollowUps,
            ...$this->warrantyReturnIndicator($ordersCount, $warrantyReturns),
        ]);
    }

    public function kpisFinancialOrder($timeRange)
    {
        [$startDate, $endDate] = $this->getRange($timeRange);
        $today = now()->startOfDay();
        $monthStart = now()->startOfMonth()->startOfDay();
        $elapsedMonthDays = max(1, $monthStart->diffInDays($today) + 1);
        $daysInMonth = now()->daysInMonth;

        $rangeDays = max(1, $startDate->diffInDays($endDate) + 1);

        // ===== RANGE =====
        $rangeService = Order::where('service_status', OrderStatus::DELIVERED)
            ->whereNotNull('delivery_date')
            ->whereBetween('delivery_date', [$startDate, $endDate])
            ->sum('service_value');

        $rangeParts = Order::where('service_status', OrderStatus::DELIVERED)
            ->whereNotNull('delivery_date')
            ->whereBetween('delivery_date', [$startDate, $endDate])
            ->sum('parts_value');

        $rangeTotal = $rangeService + $rangeParts;

        // ===== TODAY =====
        $todayService = Order::where('service_status', OrderStatus::DELIVERED)
            ->whereNotNull('delivery_date')
            ->whereDate('delivery_date', $today)
            ->sum('service_value');

        $todayParts = Order::where('service_status', OrderStatus::DELIVERED)
            ->whereNotNull('delivery_date')
            ->whereDate('delivery_date', $today)
            ->sum('parts_value');

        $todayTotal = $todayService + $todayParts;

        // ===== MÊS CORRENTE / PROJEÇÃO =====
        $monthService = Order::where('service_status', OrderStatus::DELIVERED)
            ->whereNotNull('delivery_date')
            ->whereBetween('delivery_date', [$monthStart, $today->copy()->endOfDay()])
            ->sum('service_value');

        $monthParts = Order::where('service_status', OrderStatus::DELIVERED)
            ->whereNotNull('delivery_date')
            ->whereBetween('delivery_date', [$monthStart, $today->copy()->endOfDay()])
            ->sum('parts_value');

        $monthTotal = $monthService + $monthParts;
        $monthOrdersCount = Order::where('service_status', OrderStatus::DELIVERED)
            ->whereNotNull('delivery_date')
            ->whereBetween('delivery_date', [$monthStart, $today->copy()->endOfDay()])
            ->count();

        $projectedMonthService = ($monthService / $elapsedMonthDays) * $daysInMonth;
        $projectedMonthParts = ($monthParts / $elapsedMonthDays) * $daysInMonth;
        $projectedMonthTotal = $projectedMonthService + $projectedMonthParts;

        // ===== ORDERS =====
        $ordersCount = Order::where('service_status', OrderStatus::DELIVERED)
            ->whereNotNull('delivery_date')
            ->whereBetween('delivery_date', [$startDate, $endDate])
            ->count();
        $ordersTodayCount = Order::where('service_status', OrderStatus::DELIVERED)
            ->whereNotNull('delivery_date')
            ->whereDate('delivery_date', $today)
            ->count();

        // ===== MÉDIA DIÁRIA =====
        $dailyAverageService = $rangeDays > 0 ? $rangeService / $rangeDays : 0;
        $dailyAverageParts = $rangeDays > 0 ? $rangeParts / $rangeDays : 0;
        $dailyAverageTotal = $dailyAverageService + $dailyAverageParts;

        // ===== TICKET MÉDIO =====
        $averageTicketService = $ordersCount > 0 ? $rangeService / $ordersCount : 0;
        $averageTicketParts = $ordersCount > 0 ? $rangeParts / $ordersCount : 0;
        $averageTicketTotal = $averageTicketService + $averageTicketParts;

        return response()->json([
            'range' => $timeRange,
            'kpis' => [

                'today_revenue' => [
                    'services' => $todayService,
                    'parts' => $todayParts,
                    'total' => $todayTotal,
                ],

                'month_projection' => [
                    'services' => $projectedMonthService,
                    'parts' => $projectedMonthParts,
                    'total' => $projectedMonthTotal,
                ],

                'range_revenue' => [
                    'services' => $rangeService,
                    'parts' => $rangeParts,
                    'total' => $rangeTotal,
                ],

                'daily_average' => [
                    'services' => $dailyAverageService,
                    'parts' => $dailyAverageParts,
                    'total' => $dailyAverageTotal,
                ],

                'average_ticket' => [
                    'services' => $averageTicketService,
                    'parts' => $averageTicketParts,
                    'total' => $averageTicketTotal,
                ],

                'orders_count' => $ordersCount,
                'orders_today_count' => $ordersTodayCount,
                'orders_month_count' => $monthOrdersCount,
                'month_revenue' => [
                    'services' => $monthService,
                    'parts' => $monthParts,
                    'total' => $monthTotal,
                ],
            ],
        ]);
    }

    public function financialRevenueChart($timeRange)
    {
        [$startDate, $endDate] = $this->getRange($timeRange);

        $orders = Order::select(
            DB::raw('DATE(delivery_date) as date'),
            DB::raw('SUM(service_value) as services'),
            DB::raw('SUM(parts_value) as parts'),
            DB::raw('SUM(service_value + parts_value) as total')
        )
            ->where('service_status', OrderStatus::DELIVERED)
            ->whereNotNull('delivery_date')
            ->whereBetween('delivery_date', [$startDate, $endDate])
            ->groupBy('date')
            ->pluck('total', 'date')
            ->toArray();

        $services = Order::select(
            DB::raw('DATE(delivery_date) as date'),
            DB::raw('SUM(service_value) as value')
        )
            ->where('service_status', OrderStatus::DELIVERED)
            ->whereNotNull('delivery_date')
            ->whereBetween('delivery_date', [$startDate, $endDate])
            ->groupBy('date')
            ->pluck('value', 'date')
            ->toArray();

        $parts = Order::select(
            DB::raw('DATE(delivery_date) as date'),
            DB::raw('SUM(parts_value) as value')
        )
            ->where('service_status', OrderStatus::DELIVERED)
            ->whereNotNull('delivery_date')
            ->whereBetween('delivery_date', [$startDate, $endDate])
            ->groupBy('date')
            ->pluck('value', 'date')
            ->toArray();

        $period = CarbonPeriod::create($startDate, $endDate);

        $data = [];

        foreach ($period as $date) {

            $d = $date->format('Y-m-d');

            $data[] = [
                'date' => $d,
                'services' => $services[$d] ?? 0,
                'parts' => $parts[$d] ?? 0,
                'total' => $orders[$d] ?? 0,
            ];
        }

        return response()->json($data);
    }

    public function kpisFinancialSales($timeRange)
    {
        [$startDate, $endDate] = $this->getRange($timeRange);
        $today = now()->startOfDay();
        $monthStart = now()->startOfMonth()->startOfDay();
        $elapsedMonthDays = max(1, $monthStart->diffInDays($today) + 1);
        $daysInMonth = now()->daysInMonth;

        $rangeDays = max(1, $startDate->diffInDays($endDate) + 1);

        $rangeRevenue = Sale::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');

        $rangeCashExits = CashSession::query()
            ->whereNotNull('closed_at')
            ->whereBetween('closed_at', [$startDate, $endDate])
            ->sum('manual_exits');

        $rangeRegisteredExpenses = Expense::query()
            ->whereBetween('expense_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount');

        $rangeExpenses = $rangeCashExits + $rangeRegisteredExpenses;

        $todayRevenue = Sale::where('status', 'completed')
            ->whereDate('created_at', $today)
            ->sum('total_amount');

        $todayCashExits = CashSession::query()
            ->whereNotNull('closed_at')
            ->whereDate('closed_at', $today)
            ->sum('manual_exits');

        $todayRegisteredExpenses = Expense::query()
            ->whereDate('expense_date', $today)
            ->sum('amount');

        $todayExpenses = $todayCashExits + $todayRegisteredExpenses;

        $monthRevenue = Sale::where('status', 'completed')
            ->whereBetween('created_at', [$monthStart, $today->copy()->endOfDay()])
            ->sum('total_amount');

        $monthSalesCount = Sale::where('status', 'completed')
            ->whereBetween('created_at', [$monthStart, $today->copy()->endOfDay()])
            ->count();

        $salesCount = Sale::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $salesTodayCount = Sale::where('status', 'completed')
            ->whereDate('created_at', $today)
            ->count();

        $dailyAverage = $rangeDays > 0 ? $rangeRevenue / $rangeDays : 0;
        $dailyExpenseAverage = $rangeDays > 0 ? $rangeExpenses / $rangeDays : 0;
        $averageTicket = $salesCount > 0 ? $rangeRevenue / $salesCount : 0;
        $rangeProfit = $rangeRevenue - $rangeExpenses;
        $todayProfit = $todayRevenue - $todayExpenses;
        $monthProjectionRevenue = ($monthRevenue / $elapsedMonthDays) * $daysInMonth;
        $dailyProfitAverage = $rangeDays > 0 ? $rangeProfit / $rangeDays : 0;
        $paymentMethodsRaw = Sale::query()
            ->select('payment_method', DB::raw('SUM(total_amount) as total'))
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('payment_method')
            ->pluck('total', 'payment_method')
            ->toArray();
        $paymentMethods = [
            'pix' => (float) ($paymentMethodsRaw['pix'] ?? 0),
            'cartao' => (float) ($paymentMethodsRaw['cartao'] ?? 0),
            'dinheiro' => (float) ($paymentMethodsRaw['dinheiro'] ?? 0),
            'transferencia' => (float) ($paymentMethodsRaw['transferencia'] ?? 0),
            'boleto' => (float) ($paymentMethodsRaw['boleto'] ?? 0),
        ];

        return response()->json([
            'range' => $timeRange,
            'kpis' => [
                'today_revenue' => $todayRevenue,
                'today_expenses' => $todayExpenses,
                'today_profit' => $todayProfit,
                'month_projection_revenue' => $monthProjectionRevenue,
                'month_revenue' => $monthRevenue,
                'range_revenue' => $rangeRevenue,
                'range_expenses' => $rangeExpenses,
                'range_profit' => $rangeProfit,
                'range_cash_exits' => $rangeCashExits,
                'range_registered_expenses' => $rangeRegisteredExpenses,
                'daily_average' => $dailyAverage,
                'daily_expense_average' => $dailyExpenseAverage,
                'daily_profit_average' => $dailyProfitAverage,
                'average_ticket' => $averageTicket,
                'sales_count' => $salesCount,
                'sales_today_count' => $salesTodayCount,
                'sales_month_count' => $monthSalesCount,
                'payment_methods' => $paymentMethods,
            ],
        ]);
    }

    public function financialSalesRevenueChart($timeRange)
    {
        [$startDate, $endDate] = $this->getRange($timeRange);

        $totals = Sale::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total_amount) as value')
        )
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->pluck('value', 'date')
            ->toArray();

        $paid = Sale::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total_amount) as value')
        )
            ->where('status', 'completed')
            ->where('financial_status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->pluck('value', 'date')
            ->toArray();

        $pending = Sale::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total_amount) as value')
        )
            ->where('status', 'completed')
            ->where('financial_status', 'pending')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->pluck('value', 'date')
            ->toArray();

        $partial = Sale::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total_amount) as value')
        )
            ->where('status', 'completed')
            ->where('financial_status', 'partial')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->pluck('value', 'date')
            ->toArray();

        $cashExits = CashSession::select(
            DB::raw('DATE(closed_at) as date'),
            DB::raw('SUM(manual_exits) as value')
        )
            ->whereNotNull('closed_at')
            ->whereBetween('closed_at', [$startDate, $endDate])
            ->groupBy('date')
            ->pluck('value', 'date')
            ->toArray();

        $registeredExpenses = Expense::select(
            DB::raw('DATE(expense_date) as date'),
            DB::raw('SUM(amount) as value')
        )
            ->whereBetween('expense_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->groupBy('date')
            ->pluck('value', 'date')
            ->toArray();

        $period = CarbonPeriod::create($startDate, $endDate);

        $data = [];

        foreach ($period as $date) {
            $d = $date->format('Y-m-d');

            $dayExpenses = ($cashExits[$d] ?? 0) + ($registeredExpenses[$d] ?? 0);

            $data[] = [
                'date' => $d,
                'total' => $totals[$d] ?? 0,
                'paid' => $paid[$d] ?? 0,
                'pending' => $pending[$d] ?? 0,
                'partial' => $partial[$d] ?? 0,
                'expenses' => $dayExpenses,
                'profit' => ($totals[$d] ?? 0) - $dayExpenses,
            ];
        }

        return response()->json($data);
    }
}
