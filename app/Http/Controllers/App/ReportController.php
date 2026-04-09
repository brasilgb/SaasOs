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
        $reportMeta = [];

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
