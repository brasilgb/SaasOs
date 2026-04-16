<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\CashSession;
use App\Models\App\Other;
use App\Models\App\Sale;
use App\Models\App\SaleLog;
use App\Services\OperationalAuditService;
use App\Services\SaleService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function __construct(
        private readonly OperationalAuditService $operationalAuditService,
        private readonly SaleService $saleService,
    ) {}

    private function logSaleAction(Sale $sale, string $action, array $data = []): void
    {
        SaleLog::create([
            'sale_id' => $sale->id,
            'user_id' => Auth::id(),
            'action' => $action,
            'data' => $data,
        ]);
    }

    private function logOperationalAudit(string $action, Sale $sale, array $data = []): void
    {
        $this->operationalAuditService->record($action, 'sale', $sale, Auth::id(), $data);
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Sale::class);

        $search = $request->search;
        $financialStatus = $request->get('financial_status');
        $baseQuery = Sale::query();

        if ($search) {
            $baseQuery->where(function ($q) use ($search) {
                $q->where('sales_number', 'like', '%'.$search.'%')
                    ->orWhereHas('customer', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', '%'.$search.'%');
                    });
            });
        }

        $counts = [
            'paid' => (clone $baseQuery)->where('financial_status', 'paid')->count(),
            'partial' => (clone $baseQuery)->where('financial_status', 'partial')->count(),
            'pending' => (clone $baseQuery)->where('financial_status', 'pending')->count(),
            'cancelled' => (clone $baseQuery)->where('financial_status', 'cancelled')->count(),
        ];

        $query = (clone $baseQuery)
            ->with('customer')
            ->with('items.part')
            ->with('cancelledBy:id,name')
            ->with('fiscalRegisteredBy:id,name')
            ->with('logs.user:id,name')
            ->orderBy('id', 'DESC');

        if ($financialStatus) {
            $query->where('financial_status', $financialStatus);
        }
        $sales = $query->paginate(11)->withQueryString();

        return Inertia::render('app/sales/index', [
            'sales' => $sales,
            'search' => $search,
            'financial_status' => $financialStatus,
            'financial_counts' => $counts,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Sale::class);

        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'total_amount' => 'required|numeric',
            'paid_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:pix,cartao,dinheiro,transferencia,boleto',
            'parts' => 'required|array',
            'parts.*.part_id' => 'required|exists:parts,id',
            'parts.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            $sale = $this->saleService->create($request->only([
                'customer_id',
                'total_amount',
                'paid_amount',
                'payment_method',
                'parts',
            ]));

            $this->logSaleAction($sale, 'created', [
                'payment_method' => $sale->payment_method,
                'total_amount' => (float) $sale->total_amount,
                'paid_amount' => (float) $sale->paid_amount,
                'financial_status' => $sale->financial_status,
            ]);

            return response()->json([
                'success' => true,
                'sale' => [
                    'id' => $sale->id,
                    'sales_number' => $sale->sales_number,
                    'date' => $sale->created_at,
                    'total_amount' => (float) $sale->total_amount,
                    'payment_method' => $sale->payment_method,
                    'paid_amount' => (float) $sale->paid_amount,
                    'financial_status' => $sale->financial_status,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function cancel(Sale $sale)
    {
        $this->authorize('update', $sale);
        $user = Auth::user();

        $validated = request()->validate([
            'cancel_reason' => 'required|string|min:8|max:500',
        ]);

        try {
            $sale = $this->saleService->cancel($sale, $validated['cancel_reason'], $user instanceof User ? $user : null);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $this->logSaleAction($sale, 'cancelled', [
            'reason' => $validated['cancel_reason'],
        ]);

        $this->logOperationalAudit('sale_cancelled', $sale, [
            'reason' => $validated['cancel_reason'],
            'status' => $sale->status,
            'financial_status' => $sale->financial_status,
            'cash_session_id' => $sale->cash_session_id,
            'total_amount' => (float) $sale->total_amount,
            'paid_amount' => (float) $sale->paid_amount,
        ]);

        return back()->with('success', 'Venda cancelada com sucesso.');
    }

    public function destroy(Sale $sale)
    {
        $this->authorize('delete', $sale);
        $user = Auth::user();

        try {
            $this->logOperationalAudit('sale_deleted', $sale, [
                'status' => $sale->status,
                'financial_status' => $sale->financial_status,
                'cash_session_id' => $sale->cash_session_id,
                'cancelled_by' => $sale->cancelled_by,
                'cancel_reason' => $sale->cancel_reason,
                'total_amount' => (float) $sale->total_amount,
                'paid_amount' => (float) $sale->paid_amount,
            ]);

            $this->saleService->delete($sale, $user instanceof User ? $user : null);

            return redirect()->route('app.sales.index')->with('success', 'Venda cancelada excluída com sucesso.');
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function registerFiscal(Request $request, Sale $sale)
    {
        $this->authorize('update', $sale);

        $validated = $request->validate([
            'fiscal_document_number' => 'required|string|max:120',
            'fiscal_document_url' => 'nullable|url|max:500',
            'fiscal_issued_at' => 'nullable|date',
            'fiscal_notes' => 'nullable|string|max:2000',
        ]);

        try {
            $sale = $this->saleService->registerFiscal($sale, $validated, (int) Auth::id());
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $this->logSaleAction($sale, 'fiscal_registered', [
            'fiscal_document_number' => $sale->fiscal_document_number,
            'fiscal_document_key' => $sale->fiscal_document_key,
        ]);

        return back()->with('success', 'Comprovante fiscal registrado com sucesso.');
    }
}
