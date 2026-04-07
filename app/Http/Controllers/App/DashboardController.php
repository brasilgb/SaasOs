<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Message;
use App\Models\App\Order;
use App\Models\App\Other;
use App\Models\App\Part;
use App\Models\App\Sale;
use App\Models\App\Schedule;
use App\Models\User;
use Carbon\CarbonPeriod;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $startDate = Carbon::now()->subDays(10)->startOfDay();
        $endDate = Carbon::now()->subDays(7)->endOfDay();
        $today = Carbon::today();
        $tomorrow = Carbon::tomorrow();

        $pendingOrdersQuery = Order::query()
            ->whereNotNull('delivery_forecast')
            ->whereNotIn('service_status', [2, 8, 10]);

        $acount = [
            'numuser' => User::count(),
            'numcust' => Customer::count(),
            'numorde' => Order::count(),
            'numorde_due_today' => (clone $pendingOrdersQuery)->whereDate('delivery_forecast', $today)->count(),
            'numorde_due_tomorrow' => (clone $pendingOrdersQuery)->whereDate('delivery_forecast', $tomorrow)->count(),
            'numshed' => Schedule::count(),
            'nummess' => Message::count(),
            'numparts' => Part::where('type', 'part')->count(),
            'numproducts' => Part::where('type', 'product')->count(),
        ];
        $orders = [
            'agendados' => Schedule::where('status', 1)->get('schedules_number'),
            'gerados' => Order::where('service_status', 3)->get('order_number'),
            'aprovados' => Order::where('service_status', 4)->get('order_number'),
            'concluidosca' => Order::where('service_status', 9)->get('order_number'),
            'concluidoscn' => Order::where('service_status', 7)->get('order_number'),
            'feedback' => Order::where('service_status', 10)
                ->whereBetween('delivery_date', [$startDate, $endDate])
                ->get('order_number'),
        ];
        $listSchedules= Schedule::with('user', 'customer')->get();
        $parts = Part::where('is_sellable', true)->get();
        $customers = Customer::get();
        $others = Other::first();

        return Inertia::render('app/dashboard/index', [ 'listSchedules' => $listSchedules, 'reloadKey' => now()->timestamp, 'orders' => $orders, 'acount' => $acount, 'parts' => $parts, 'customers' => $customers, 'others' => $others]);
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
        $start = Carbon::now()->subDays($timerange)->startOfDay();
        $end = Carbon::now()->endOfDay();

        return [$start, $end];
    }

    public function chartEquipments($timerange)
    {
        [$start, $end] = $this->getRange($timerange);

        $equipments = Equipment::where('chart', 1)
            ->limit(3)
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

    public function metricsSystem($timerange)
    {
        [$startDate, $endDate] = $this->getRange($timerange);

        return response()->json([

            'customers' => Customer::whereBetween('created_at', [$startDate, $endDate])->count(),

            'orders' => Order::whereBetween('created_at', [$startDate, $endDate])->count(),

            'schedules' => Schedule::whereBetween('created_at', [$startDate, $endDate])->count(),

            'messages' => Message::whereBetween('created_at', [$startDate, $endDate])->count(),

            'parts' => Part::where('type', 'part')->whereBetween('created_at', [$startDate, $endDate])->count(),

            'products' => Part::where('type', 'product')->whereBetween('created_at', [$startDate, $endDate])->count(),
        ]);
    }

    public function kpisFinancialOrder($timeRange)
    {
        [$startDate, $endDate] = $this->getRange($timeRange);
        $today = now()->startOfDay();

        $rangeDays = max(1, $startDate->diffInDays($endDate) + 1);

        // ===== RANGE =====
        $rangeService = Order::where('service_status', 10)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('service_value');

        $rangeParts = Order::where('service_status', 10)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('parts_value');

        $rangeTotal = $rangeService + $rangeParts;

        // ===== TODAY =====
        $todayService = Order::where('service_status', 10)
            ->whereDate('created_at', $today)
            ->sum('service_value');

        $todayParts = Order::where('service_status', 10)
            ->whereDate('created_at', $today)
            ->sum('parts_value');

        $todayTotal = $todayService + $todayParts;

        // ===== ORDERS =====
        $ordersCount = Order::where('service_status', 10)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        $ordersTodayCount = Order::where('service_status', 10)
            ->whereDate('created_at', $today)
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
            ],
        ]);
    }

    public function financialRevenueChart($timeRange)
    {
        [$startDate, $endDate] = $this->getRange($timeRange);

        $orders = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(service_value) as services'),
            DB::raw('SUM(parts_value) as parts'),
            DB::raw('SUM(service_value + parts_value) as total')
        )
            ->where('service_status', 10)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->pluck('total', 'date')
            ->toArray();

        $services = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(service_value) as value')
        )
            ->where('service_status', 10)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->pluck('value', 'date')
            ->toArray();

        $parts = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(parts_value) as value')
        )
            ->where('service_status', 10)
            ->whereBetween('created_at', [$startDate, $endDate])
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

        $rangeDays = max(1, $startDate->diffInDays($endDate) + 1);

        $rangeRevenue = Sale::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');

        $todayRevenue = Sale::where('status', 'completed')
            ->whereDate('created_at', $today)
            ->sum('total_amount');

        $salesCount = Sale::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $salesTodayCount = Sale::where('status', 'completed')
            ->whereDate('created_at', $today)
            ->count();

        $dailyAverage = $rangeDays > 0 ? $rangeRevenue / $rangeDays : 0;
        $averageTicket = $salesCount > 0 ? $rangeRevenue / $salesCount : 0;

        return response()->json([
            'range' => $timeRange,
            'kpis' => [
                'today_revenue' => $todayRevenue,
                'range_revenue' => $rangeRevenue,
                'daily_average' => $dailyAverage,
                'average_ticket' => $averageTicket,
                'sales_count' => $salesCount,
                'sales_today_count' => $salesTodayCount,
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

        $period = CarbonPeriod::create($startDate, $endDate);

        $data = [];

        foreach ($period as $date) {
            $d = $date->format('Y-m-d');

            $data[] = [
                'date' => $d,
                'total' => $totals[$d] ?? 0,
                'paid' => $paid[$d] ?? 0,
                'pending' => $pending[$d] ?? 0,
                'partial' => $partial[$d] ?? 0,
            ];
        }

        return response()->json($data);
    }
}
