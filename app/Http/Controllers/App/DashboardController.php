<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Admin\Plan;
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Message;
use App\Models\App\Order;
use App\Models\App\Other;
use App\Models\App\Schedule;
use App\Models\App\Part;
use App\Models\User;
use Illuminate\Support\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $startDate = Carbon::now()->subDays(10)->startOfDay();
        $endDate = Carbon::now()->subDays(7)->endOfDay();

        $acount = [
            'numuser' => count(User::get()),
            'numcust' => count(Customer::get()),
            'numorde' => count(Order::get()),
            'numshed' => count(Schedule::get()),
            'nummess' => count(Message::get()),
            'numparts' => count(Part::get()),
        ];
        $orders = [
            'agendados' => Schedule::where('status', 1)->get('schedules_number'),
            'gerados'    => Order::where('service_status', 3)->get('order_number'),
            'aprovados'  => Order::where('service_status', 4)->get('order_number'),
            'concluidosca' => Order::where('service_status', 6)->get('order_number'),
            'concluidoscn' => Order::where('service_status', 7)->get('order_number'),
            'feedback' => Order::where('service_status', 8)
                ->whereBetween('delivery_date', [$startDate, $endDate])
                ->get('order_number')
        ];

        $parts = Part::get();
        $customers = Customer::get();
        $others = Other::first();
        return Inertia::render('app/dashboard/index', ['reloadKey' => now()->timestamp, 'orders' => $orders, 'acount' => $acount, 'parts' => $parts, 'customers' => $customers, 'others' => $others]);
    }

    public function chartEquipments($timerange)
    {
        $start = Carbon::now()->subDays($timerange)->startOfDay();
        $end = Carbon::now()->endOfDay();

        $equipments = Equipment::where('chart', 1)
            ->limit(3)
            ->get();

        $selects = [
            DB::raw('DATE(created_at) as date')
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
                'date' => $date->format('Y-m-d')
            ];

            foreach ($equipments as $equipment) {

                $field = "eq_{$equipment->id}";

                $row[$field] = $orders[$key]->$field ?? 0;
            }

            $result[] = $row;
        }

        return response()->json([
            'lines' => $equipments->map(fn($e) => [
                'key'   => "eq_{$e->id}",
                'label' => $e->equipment,
            ]),
            'data' => $result
        ]);
    }

    public function fluxsOrders($timerange)
    {
        $start = Carbon::now()->subDays($timerange)->startOfDay();
        $end = Carbon::now()->endOfDay();

        $orders = Order::selectRaw("
            DATE(created_at) as date,
            COUNT(*) as entradas,
            SUM(CASE WHEN service_status IN (6,7) THEN 1 ELSE 0 END) as concluidos,
            SUM(CASE WHEN service_status = 8 THEN 1 ELSE 0 END) as entregues
        ")
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
                'entregues' => $data->entregues ?? 0
            ];
        }

        return response()->json($result);
    }

    public function metricsSystem($timerange)
    {
        $startDate = now()->subDays($timerange);

        return response()->json([

            'customers' => Customer::where('created_at', '>=', $startDate)->count(),

            'orders' => Order::where('created_at', '>=', $startDate)->count(),

            'schedules' => Schedule::where('created_at', '>=', $startDate)->count(),

            'messages' => Message::where('created_at', '>=', $startDate)->count(),

            'parts' => Part::where('created_at', '>=', $startDate)->count(),
        ]);
    }

    public function kpisFinancialOrder($timeRange)
    {
        $startDate = now()->subDays($timeRange)->startOfDay();
        $endDate = now()->endOfDay();
        $today = now()->startOfDay();

        // ===== RANGE =====
        $rangeService = Order::where('service_status', 8)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('service_value');

        $rangeParts = Order::where('service_status', 8)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('parts_value');

        $rangeTotal = $rangeService + $rangeParts;

        // ===== TODAY =====
        $todayService = Order::where('service_status', 8)
            ->whereDate('created_at', $today)
            ->sum('service_value');

        $todayParts = Order::where('service_status', 8)
            ->whereDate('created_at', $today)
            ->sum('parts_value');

        $todayTotal = $todayService + $todayParts;

        // ===== ORDERS =====
        $ordersCount = Order::where('service_status', 8)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // ===== MÉDIA DIÁRIA =====
        $dailyAverageService = $timeRange > 0 ? $rangeService / $timeRange : 0;
        $dailyAverageParts = $timeRange > 0 ? $rangeParts / $timeRange : 0;
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
                    'total' => $todayTotal
                ],

                'range_revenue' => [
                    'services' => $rangeService,
                    'parts' => $rangeParts,
                    'total' => $rangeTotal
                ],

                'daily_average' => [
                    'services' => $dailyAverageService,
                    'parts' => $dailyAverageParts,
                    'total' => $dailyAverageTotal
                ],

                'average_ticket' => [
                    'services' => $averageTicketService,
                    'parts' => $averageTicketParts,
                    'total' => $averageTicketTotal
                ],

                'orders_count' => $ordersCount
            ]
        ]);
    }

    public function financialRevenueChart($timeRange)
{
    $startDate = now()->subDays($timeRange)->startOfDay();
    $endDate = now()->endOfDay();

    $orders = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(service_value) as services'),
            DB::raw('SUM(parts_value) as parts'),
            DB::raw('SUM(service_value + parts_value) as total')
        )
        ->where('service_status', 8)
        ->whereBetween('created_at', [$startDate, $endDate])
        ->groupBy('date')
        ->pluck('total','date')
        ->toArray();

    $services = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(service_value) as value')
        )
        ->where('service_status', 8)
        ->whereBetween('created_at', [$startDate, $endDate])
        ->groupBy('date')
        ->pluck('value','date')
        ->toArray();

    $parts = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(parts_value) as value')
        )
        ->where('service_status', 8)
        ->whereBetween('created_at', [$startDate, $endDate])
        ->groupBy('date')
        ->pluck('value','date')
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
}
