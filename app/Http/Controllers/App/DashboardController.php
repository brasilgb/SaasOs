<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Customer;
use App\Models\App\Message;
use App\Models\App\Order;
use App\Models\App\Other;
use App\Models\App\Schedule;
use App\Models\App\Part;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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
        $chartequipments = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(CASE WHEN equipment_id = 1 THEN 1 ELSE 0 END) as mobile'),
            DB::raw('SUM(CASE WHEN equipment_id = 2 THEN 1 ELSE 0 END) as desktop'),
            DB::raw('SUM(CASE WHEN equipment_id = 3 THEN 1 ELSE 0 END) as notebook')
        )
            ->where('created_at', '>=', Carbon::now()->subDays($timerange))
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();
        return response()->json($chartequipments);
    }
}
