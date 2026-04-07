<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Customer;
use App\Models\App\Order;
use App\Models\App\Other;
use App\Models\App\Part;
use App\Models\App\Sale;
use App\Models\App\Schedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportController extends Controller
{
    private function authorizeReportsAccess(): void
    {
        abort_unless(Auth::user()?->hasPermission('reports'), 403);
    }

    private function canUseSalesReports(): bool
    {
        $user = Auth::user();
        $otherSetting = Other::query()->first();

        return (bool) ($user?->hasPermission('sales') && $otherSetting?->enablesales);
    }

    public function index(Request $request)
    {
        $this->authorizeReportsAccess();

        return Inertia::render('app/reports/index');
    }

    public function store(Request $request)
    {
        $this->authorizeReportsAccess();

        $type = $request->input('type');
        $from = Carbon::parse($request->input('from'))->startOfDay();
        $to = Carbon::parse($request->input('to'))->endOfDay();

        switch ($type) {
            case 'orders':
                $data = Order::with(['customer', 'equipment', 'user'])
                    ->whereBetween('created_at', [$from, $to])
                    ->orderBy('created_at', 'desc')
                    ->get();
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
                break;

            case 'parts':
                $data = Part::with('part_movements')
                    ->whereBetween('created_at', [$from, $to])
                    ->get();
                break;

            default:
                $data = collect();
        }

        return Inertia::render('app/reports/index', [
            'reportData' => $data,
            'type' => $type,
        ]);
    }
}
