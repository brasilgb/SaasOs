<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\AccountPayable;
use App\Models\App\OrderCommission;
use App\Models\User;
use App\Support\Pagination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class TechnicianCommissionController extends Controller
{
    private function authorizeAccess(): ?Response
    {
        if (Gate::allows('viewAny', AccountPayable::class)) {
            return null;
        }

        return redirect()->route('app.dashboard')->with('error', 'Módulo financeiro desabilitado ou acesso não permitido.');
    }

    public function index(Request $request)
    {
        if ($response = $this->authorizeAccess()) {
            return $response;
        }

        $technicianId = $request->integer('technician_id') ?: null;
        $status = trim((string) $request->get('status', ''));
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = OrderCommission::query()
            ->with([
                'order:id,order_number,delivery_date,customer_id',
                'order.customer:id,name',
                'technician:id,name',
                'accountPayable:id,status,total_amount,paid_amount,balance_amount,due_date',
            ])
            ->orderByDesc('created_at');

        if ($technicianId) {
            $query->where('user_id', $technicianId);
        }

        if (in_array($status, [AccountPayable::STATUS_PENDING, AccountPayable::STATUS_PARTIAL, AccountPayable::STATUS_PAID], true)) {
            $query->whereHas('accountPayable', fn ($q) => $q->where('status', $status));
        }

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $commissions = $query->paginate(Pagination::perPage())->withQueryString();

        $totals = [
            'commission_amount' => (float) OrderCommission::query()->sum('commission_amount'),
            'paid_amount' => (float) AccountPayable::query()
                ->where('source_type', AccountPayable::SOURCE_TECHNICIAN_COMMISSION)
                ->sum('paid_amount'),
            'pending_amount' => (float) AccountPayable::query()
                ->where('source_type', AccountPayable::SOURCE_TECHNICIAN_COMMISSION)
                ->sum('balance_amount'),
        ];

        $technicians = User::query()
            ->where('roles', User::ROLE_TECHNICIAN)
            ->orderBy('name')
            ->get(['id', 'name', 'commission_percentage']);

        return Inertia::render('app/technician-commissions/index', [
            'commissions' => $commissions,
            'totals' => $totals,
            'technicians' => $technicians,
            'filters' => [
                'technician_id' => $technicianId,
                'status' => $status,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
