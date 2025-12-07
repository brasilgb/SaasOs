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
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $startDate = Carbon::now()->subDays(7)->startOfDay();
        $endDate = Carbon::now()->subDays(4)->endOfDay();

        $acount = [
            'numuser' => count(User::get()),
            'numcust' => count(Customer::get()),
            'numorde' => count(Order::get()),
            'numshed' => count(Schedule::get()),
            'nummess' => count(Message::get()),
            'numparts' => count(Part::get()),
        ];
        $orders = [
            'agendados' => Schedule::where('status', 1)->get('id'),
            'gerados'    => Order::where('service_status', 3)->get('id'),
            'aprovados'  => Order::where('service_status', 4)->get('id'),
            'concluidosca' => Order::where('service_status', 6)->get('id'),
            'concluidoscn' => Order::where('service_status', 7)->get('id'),
            'feedback' => Order::where('service_status', 8)
                ->whereBetween('delivery_date', [$startDate, $endDate])
                ->get('id')
        ];
        
        $chartequipments = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(CASE WHEN equipment_id = 1 THEN 1 ELSE 0 END) as mobile_count'),
            DB::raw('SUM(CASE WHEN equipment_id = 2 THEN 1 ELSE 0 END) as desktop_count'),
            DB::raw('SUM(CASE WHEN equipment_id = 3 THEN 1 ELSE 0 END) as notebook_count')
        )
        ->whereBetween('created_at', [Carbon::now()->subMonths(2), Carbon::now()])
        ->groupBy('date')
        ->orderBy('date', 'desc')
        ->get();

        $parts = Part::get();
        $customers = Customer::get();
        $others = Other::first();
        // $chartequipments = response()->json($cequipments);
        return Inertia::render('app/dashboard/index', ['orders' => $orders, 'acount' => $acount, 'chartequipments' => $chartequipments, 'parts' => $parts, 'customers' => $customers, 'others' => $others]);
    }
}
