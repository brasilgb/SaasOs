<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseOrderRequest;
use App\Models\App\Part;
use App\Models\App\PurchaseOrder;
use App\Models\App\PurchaseOrderItem;
use App\Models\App\Supplier;
use App\Services\PurchaseOrderService;
use App\Support\Pagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class PurchaseOrderController extends Controller
{
    public function __construct(private readonly PurchaseOrderService $purchaseOrderService) {}

    private function authorizePurchaseOrderAccess(?PurchaseOrder $purchaseOrder = null, string $ability = 'viewAny'): ?Response
    {
        $allowed = $purchaseOrder
            ? Gate::allows($ability, $purchaseOrder)
            : Gate::allows($ability, PurchaseOrder::class);

        if ($allowed) {
            return null;
        }

        if (request()->expectsJson()) {
            return response()->json([
                'message' => 'Módulo de compras desabilitado ou acesso não permitido.',
            ], 403);
        }

        return redirect()->route('app.dashboard')->with('error', 'Módulo de compras desabilitado ou acesso não permitido.');
    }

    public function index(Request $request)
    {
        if ($response = $this->authorizePurchaseOrderAccess()) {
            return $response;
        }

        $search = trim((string) $request->get('search', ''));
        $status = trim((string) $request->get('status', ''));

        $query = PurchaseOrder::query()
            ->with('supplier:id,name')
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('purchase_order_number', 'like', '%'.$search.'%')
                    ->orWhereHas('supplier', fn ($supplierQuery) => $supplierQuery->where('name', 'like', '%'.$search.'%'));
            });
        }

        if (in_array($status, [
            PurchaseOrder::STATUS_DRAFT,
            PurchaseOrder::STATUS_SENT,
            PurchaseOrder::STATUS_RECEIVED,
            PurchaseOrder::STATUS_CANCELLED,
        ], true)) {
            $query->where('status', $status);
        }

        $purchaseOrders = $query->paginate(Pagination::perPage())->withQueryString();

        return Inertia::render('app/purchase-orders/index', [
            'purchaseOrders' => $purchaseOrders,
            'search' => $search,
            'status' => $status,
        ]);
    }

    public function create(Request $request)
    {
        if ($response = $this->authorizePurchaseOrderAccess(null, 'create')) {
            return $response;
        }

        return Inertia::render('app/purchase-orders/create', [
            'suppliers' => Supplier::query()->where('status', true)->orderBy('name')->get(['id', 'name']),
            'suggestedItem' => $this->buildSuggestedItem($request->integer('part_id')),
        ]);
    }

    private function buildSuggestedItem(?int $partId): ?array
    {
        if (! $partId) {
            return null;
        }

        $part = Part::find($partId);

        if (! $part) {
            return null;
        }

        $lastSupplierId = PurchaseOrderItem::query()
            ->where('part_id', $part->id)
            ->whereHas('purchaseOrder', fn ($query) => $query->whereNotNull('supplier_id'))
            ->with('purchaseOrder:id,supplier_id')
            ->latest('id')
            ->first()
            ?->purchaseOrder
            ?->supplier_id;

        return [
            'part_id' => $part->id,
            'part_label' => $part->name.($part->reference_number ? " ({$part->reference_number})" : ''),
            'quantity' => max(1, (int) $part->minimum_stock_level - (int) $part->quantity + 1),
            'unit_cost' => (float) $part->cost_price,
            'supplier_id' => $lastSupplierId,
        ];
    }

    public function store(PurchaseOrderRequest $request): RedirectResponse
    {
        if ($response = $this->authorizePurchaseOrderAccess(null, 'create')) {
            return $response;
        }

        $purchaseOrder = $this->purchaseOrderService->create($request->validated(), (int) Auth::id());

        return redirect()->route('app.purchase-orders.index')->with('success', 'Ordem de compra '.$purchaseOrder->purchase_order_number.' criada com sucesso.');
    }

    public function edit(PurchaseOrder $purchaseOrder)
    {
        if ($response = $this->authorizePurchaseOrderAccess($purchaseOrder, 'update')) {
            return $response;
        }

        return Inertia::render('app/purchase-orders/create', [
            'purchaseOrder' => $purchaseOrder->load('items.part:id,name,reference_number'),
            'suppliers' => Supplier::query()->where('status', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(PurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        if ($response = $this->authorizePurchaseOrderAccess($purchaseOrder, 'update')) {
            return $response;
        }

        $this->purchaseOrderService->update($purchaseOrder, $request->validated(), (int) Auth::id());

        return redirect()->route('app.purchase-orders.index')->with('success', 'Ordem de compra atualizada com sucesso.');
    }

    public function destroy(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        if ($response = $this->authorizePurchaseOrderAccess($purchaseOrder, 'delete')) {
            return $response;
        }

        $this->purchaseOrderService->delete($purchaseOrder);

        return back()->with('success', 'Ordem de compra excluída com sucesso.');
    }

    public function send(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        if ($response = $this->authorizePurchaseOrderAccess($purchaseOrder, 'update')) {
            return $response;
        }

        $this->purchaseOrderService->send($purchaseOrder, (int) Auth::id());

        return back()->with('success', 'Ordem de compra enviada ao fornecedor.');
    }

    public function receive(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        if ($response = $this->authorizePurchaseOrderAccess($purchaseOrder, 'update')) {
            return $response;
        }

        $this->purchaseOrderService->receive($purchaseOrder, (int) Auth::id());

        return back()->with('success', 'Recebimento confirmado, estoque e financeiro atualizados.');
    }

    public function cancel(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        if ($response = $this->authorizePurchaseOrderAccess($purchaseOrder, 'update')) {
            return $response;
        }

        $this->purchaseOrderService->cancel($purchaseOrder, (int) Auth::id());

        return back()->with('success', 'Ordem de compra cancelada.');
    }
}
