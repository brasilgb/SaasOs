<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Mail\OrderCreatedMail;
use App\Mail\OrderPaymentReminderMail;
use App\Mail\OrderStatusUpdatedMail;
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\CashSession;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Models\App\OrderPayment;
use App\Models\App\OrderStatusHistory;
use App\Models\App\Part;
use App\Models\App\WhatsappMessage;
use App\Support\OrderStatus;
use App\Support\TenantMailConfig;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrderController extends Controller
{
    private function shouldSendCustomerMailer(Order $order, ?string $customerEmail): bool
    {
        $email = trim((string) ($customerEmail ?? ''));
        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        return TenantMailConfig::hasConfiguredForTenantId($order->tenant_id ? (int) $order->tenant_id : null);
    }

    private function appendPaymentReminderAvailability(Order $order): Order
    {
        $order->setAttribute(
            'can_send_payment_reminder',
            $this->shouldSendCustomerMailer($order, $order->customer?->email)
        );

        return $order;
    }

    private function communicationThresholdDays(): int
    {
        return 2;
    }

    private function isBudgetFollowUpOrder(Order $order): bool
    {
        if ((int) $order->service_status !== OrderStatus::BUDGET_GENERATED) {
            return false;
        }

        return $order->updated_at?->lte(now()->subDays($this->communicationThresholdDays())) ?? false;
    }

    private function isPendingPaymentOrder(Order $order, ?array $paymentSummary = null): bool
    {
        $paymentSummary ??= $this->buildPaymentSummary($order);
        $remaining = (float) ($paymentSummary['remaining'] ?? 0);

        if ($remaining <= 0.009) {
            return false;
        }

        if (! in_array((int) $order->service_status, [
            OrderStatus::SERVICE_COMPLETED,
            OrderStatus::CUSTOMER_NOTIFIED,
            OrderStatus::DELIVERED,
        ], true)) {
            return false;
        }

        $referenceDate = $order->delivery_date ?? $order->updated_at;

        return $referenceDate?->lte(now()->subDays($this->communicationThresholdDays())) ?? false;
    }

    private function communicationDaysPending(Order $order): int
    {
        $referenceDate = $order->delivery_date ?? $order->updated_at ?? $order->created_at;

        return $referenceDate ? max(0, $referenceDate->diffInDays(now())) : 0;
    }

    private function appendCommunicationFlags(Order $order): Order
    {
        $paymentSummary = $this->buildPaymentSummary($order);

        $order->setAttribute('communication_days_pending', $this->communicationDaysPending($order));
        $order->setAttribute('budget_follow_up', $this->isBudgetFollowUpOrder($order));
        $order->setAttribute('pending_payment_follow_up', $this->isPendingPaymentOrder($order, $paymentSummary));

        return $order;
    }

    private function currentUser(): ?User
    {
        $user = Auth::user() ?? Auth::guard('sanctum')->user();

        return $user instanceof User ? $user : null;
    }

    private function normalizeMoneyValue(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '0.00';
        }

        if (is_numeric($value)) {
            return number_format((float) $value, 2, '.', '');
        }

        $raw = trim((string) $value);

        // Suporta "1.234,56" e "1234.56"
        $normalized = str_contains($raw, ',')
            ? str_replace(',', '.', str_replace('.', '', $raw))
            : str_replace(',', '', $raw);

        return number_format((float) $normalized, 2, '.', '');
    }

    private function normalizeMoneyFloat(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (float) $this->normalizeMoneyValue($value);
    }

    private function roundMoney(float $value): float
    {
        return round($value, 2);
    }

    private function detectWarrantyReturn(
        ?int $customerId,
        ?int $equipmentId,
        ?string $model,
        ?int $ignoreOrderId = null,
    ): ?Order {
        if (! $customerId || ! $equipmentId) {
            return null;
        }

        $query = Order::query()
            ->where('customer_id', $customerId)
            ->where('equipment_id', $equipmentId)
            ->whereNotNull('delivery_date')
            ->whereNotNull('warranty_expires_at')
            ->where('warranty_expires_at', '>', now())
            ->orderByDesc('delivery_date');

        if ($ignoreOrderId) {
            $query->whereKeyNot($ignoreOrderId);
        }

        if (! empty($model)) {
            $query->where('model', $model);
        }

        return $query->first();
    }

    private function recordStatusHistory(Order $order, int $status): void
    {
        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => $status,
            'changed_by' => $this->currentUser()?->id,
            'note' => OrderStatus::label($status),
        ]);
    }

    private function logOrderAction(Order $order, string $action, array $data = []): void
    {
        OrderLog::create([
            'order_id' => $order->id,
            'user_id' => $this->currentUser()?->id,
            'action' => $action,
            'data' => $data === [] ? null : $data,
            'created_at' => now(),
        ]);
    }

    private function buildPaymentSummary(Order $order): array
    {
        $partsValue = $this->roundMoney((float) ($order->parts_value ?? 0));
        $serviceValue = $this->roundMoney((float) ($order->service_value ?? 0));
        $totalOrder = $this->roundMoney((float) ($order->service_cost ?? 0));
        $totalPaid = $this->roundMoney((float) $order->orderPayments->sum('amount'));
        $remaining = $this->roundMoney(max(0, $totalOrder - $totalPaid));

        return [
            'parts_value' => $partsValue,
            'service_value' => $serviceValue,
            'total_order' => $totalOrder,
            'total_paid' => $totalPaid,
            'remaining' => $remaining,
        ];
    }

    private function authorizeOrdersAccess(): void
    {
        abort_unless($this->currentUser()?->hasPermission('orders'), 403);
    }

    private function canManageOrders(): bool
    {
        $user = $this->currentUser();

        return $user?->hasPermission('orders') && ! $user->isTechnician();
    }

    private function canAccessOrder(Order $order): bool
    {
        $user = $this->currentUser();

        if (! $user?->hasPermission('orders')) {
            return false;
        }

        if (! $user->isTechnician()) {
            return true;
        }

        return is_null($order->user_id) || (int) $order->user_id === (int) $user->id;
    }

    private function scopeOrdersQuery($query)
    {
        $user = $this->currentUser();

        if ($user?->isTechnician()) {
            $query->where(function ($q) use ($user) {
                $q->whereNull('user_id')
                    ->orWhere('user_id', $user->id);
            });
        }

        return $query;
    }

    // Display and linting order for id
    public function allOrder()
    {
        $this->authorizeOrdersAccess();

        $dashData = [
            'numorder' => $this->scopeOrdersQuery(Order::query())->count(),
            'numabertas' => $this->scopeOrdersQuery(Order::where('service_status', OrderStatus::OPEN))->count(),
            'numgerados' => $this->scopeOrdersQuery(Order::where('service_status', OrderStatus::BUDGET_GENERATED))->count(),
            'numaprovados' => $this->scopeOrdersQuery(Order::where('service_status', OrderStatus::BUDGET_APPROVED))->count(),
            'numconcluidosca' => $this->scopeOrdersQuery(Order::where('service_status', OrderStatus::CUSTOMER_NOTIFIED))->count(),
            'numconcluidoscn' => $this->scopeOrdersQuery(Order::where('service_status', OrderStatus::SERVICE_COMPLETED))->count(),
        ];

        return [
            'success' => true,
            'result' => $dashData,
        ];
    }

    // Display and linting order for id
    public function getOrder($order)
    {
        $this->authorizeOrdersAccess();

        $query = $this->scopeOrdersQuery(Order::where('order_number', $order))->with('customer')->with('equipment')->get();

        return [
            'success' => true,
            'result' => $query,
        ];
    }

    // Display and listing customers for id order
    public function getOrderCli($customer)
    {
        $this->authorizeOrdersAccess();

        $query = $this->scopeOrdersQuery(Order::where('customer_id', $customer))->with('customer')->with('equipment')->get();

        return [
            'success' => true,
            'result' => $query,
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorizeOrdersAccess();

        $startDate = Carbon::now()->subDays(10)->startOfDay();
        $endDate = Carbon::now()->subDays(7)->endOfDay();

        $status = $request->status;
        $search = $request->search;
        $filter = $request->filter;

        $query = $this->scopeOrdersQuery(Order::query())->orderBy('id', 'DESC');

        if ($status) {
            $query->where('service_status', $status);
        }

        if ($filter === 'due_48h') {
            $today = Carbon::today();
            $tomorrow = Carbon::tomorrow();

            $query->whereNotNull('delivery_forecast')
                ->whereNotIn('service_status', [OrderStatus::CANCELLED, OrderStatus::SERVICE_NOT_EXECUTED, OrderStatus::DELIVERED])
                ->whereBetween('delivery_forecast', [$today->toDateString(), $tomorrow->toDateString()]);
        } elseif ($filter === 'feedback') {
            $query->where('service_status', OrderStatus::DELIVERED)
                ->whereBetween('delivery_date', [$startDate, $endDate])
                ->where(function ($q) {
                    $q->whereNull('feedback')->orWhere('feedback', 0);
                });
        } elseif ($filter === 'financial_open') {
            $query->whereRaw(
                '(COALESCE(orders.service_cost, 0) - COALESCE((SELECT SUM(op.amount) FROM order_payments op WHERE op.order_id = orders.id), 0)) > 0.009'
            );
        } elseif ($filter === 'budget_follow_up') {
            $query->where('service_status', OrderStatus::BUDGET_GENERATED)
                ->where('updated_at', '<=', now()->subDays($this->communicationThresholdDays()));
        } elseif ($filter === 'pending_payment_follow_up') {
            $query
                ->whereIn('service_status', [
                    OrderStatus::SERVICE_COMPLETED,
                    OrderStatus::CUSTOMER_NOTIFIED,
                    OrderStatus::DELIVERED,
                ])
                ->where(function ($subQuery) {
                    $subQuery
                        ->where(function ($dateQuery) {
                            $dateQuery->whereNotNull('delivery_date')
                                ->where('delivery_date', '<=', now()->subDays($this->communicationThresholdDays()));
                        })
                        ->orWhere(function ($dateQuery) {
                            $dateQuery->whereNull('delivery_date')
                                ->where('updated_at', '<=', now()->subDays($this->communicationThresholdDays()));
                        });
                })
                ->whereRaw(
                    '(COALESCE(orders.service_cost, 0) - COALESCE((SELECT SUM(op.amount) FROM order_payments op WHERE op.order_id = orders.id), 0)) > 0.009'
                );
        } elseif ($filter === 'warranty_return') {
            $query->where('is_warranty_return', true);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', $search)
                    ->orWhereHas('customer', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', "%$search%")
                            ->orWhere('cpfcnpj', 'like', '%' . $search . '%');
                    });
            });
        }

        $orders = $query
            ->with('equipment', 'customer')
            ->withSum('orderPayments as total_paid', 'amount')
            ->paginate(11)
            ->withQueryString();
        $orders->setCollection(
            $orders->getCollection()->map(function (Order $order) {
                $order = $this->appendPaymentReminderAvailability($order);

                return $this->appendCommunicationFlags($order);
            })
        );
        $whats = WhatsappMessage::first();

        $feedbackOrders = $this->scopeOrdersQuery(Order::query())
            ->where('service_status', OrderStatus::DELIVERED)
            ->whereBetween('delivery_date', [$startDate, $endDate])
            ->where(function ($q) {
                $q->whereNull('feedback')->orWhere('feedback', 0);
            })
            ->get(['id', 'order_number']);

        return Inertia::render('app/orders/index', [
            'orders' => $orders,
            'whats' => $whats,
            'feedback' => $feedbackOrders,
            'search' => $request->search,
            'status' => $status,
            'filter' => $filter,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        abort_unless($this->canManageOrders(), 403);

        $equipments = Equipment::get();
        $customers = Customer::get();
        $models = Order::distinct()->pluck('model');

        return Inertia::render('app/orders/create-order', ['customers' => $customers, 'equipments' => $equipments, 'models' => $models]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(OrderRequest $request): RedirectResponse
    {
        abort_unless($this->canManageOrders(), 403);

        $data = $request->all();
        $request->validated();
        $data['order_number'] = Order::exists() ? Order::latest()->first()->order_number + 1 : 1;
        $data['tracking_token'] = Str::uuid();
        $data['warranty_days'] = isset($data['warranty_days']) && $data['warranty_days'] !== '' ? max(0, (int) $data['warranty_days']) : null;
        $warrantySourceOrder = $this->detectWarrantyReturn(
            isset($data['customer_id']) ? (int) $data['customer_id'] : null,
            isset($data['equipment_id']) ? (int) $data['equipment_id'] : null,
            isset($data['model']) ? (string) $data['model'] : null,
        );
        $data['is_warranty_return'] = (bool) $warrantySourceOrder;
        $data['warranty_source_order_id'] = $warrantySourceOrder?->id;
        $order = Order::create($data);
        $this->recordStatusHistory($order, (int) $order->service_status);
        $this->logOrderAction($order, 'created', [
            'status' => (int) $order->service_status,
            'status_label' => OrderStatus::label($order->service_status),
            'is_warranty_return' => (bool) $order->is_warranty_return,
            'warranty_source_order_number' => $warrantySourceOrder?->order_number,
        ]);

        $order->load(['customer', 'tenant']);
        $customerEmail = $order->customer?->email;
        $successMessage = 'Ordem cadastrada com sucesso';

        if ($this->shouldSendCustomerMailer($order, $customerEmail)) {
            try {
                TenantMailConfig::applyForTenantId($order->tenant_id ? (int) $order->tenant_id : null);
                Mail::to($customerEmail)->send(new OrderCreatedMail($order));
            } catch (\Throwable $e) {
                report($e);
                $successMessage = 'Ordem cadastrada com sucesso, mas houve falha ao enviar o e-mail ao cliente.';
            }
        }

        return redirect()->route('app.orders.index')->with('success', $successMessage);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order, Request $request)
    {
        abort_unless($this->canAccessOrder($order), 403);

        $order->load([
            'customer',
            'orderParts',
            'orderPayments',
            'statusHistory.user:id,name',
            'logs.user:id,name',
        ]);

        $equipments = Equipment::get();
        $customers = Customer::get();
        $parts = Part::where('type', 'part')->get();

        $technicals = User::where('roles', 3)
            ->orWhere('roles', 1)
            ->where('status', 1)
            ->get();
        $models = Order::distinct()->pluck('model');
        $paymentSummary = $this->buildPaymentSummary($order);
        $order = $this->appendPaymentReminderAvailability($order);
        $warrantySourceOrder = $order->warrantySourceOrder()->first(['id', 'order_number', 'warranty_expires_at']);
        $historyQuery = Order::query()
            ->where('customer_id', $order->customer_id)
            ->where('equipment_id', $order->equipment_id)
            ->whereKeyNot($order->id)
            ->whereNotNull('delivery_date');

        if (! empty($order->model)) {
            $historyQuery->where('model', $order->model);
        }

        $equipmentHistory = $historyQuery
            ->orderByDesc('delivery_date')
            ->limit(5)
            ->get([
                'id',
                'order_number',
                'defect',
                'service_status',
                'delivery_date',
                'warranty_days',
                'warranty_expires_at',
                'service_cost',
            ]);

        $activeWarrantyOrder = $equipmentHistory
            ->first(fn (Order $historyOrder) => $historyOrder->warranty_expires_at && $historyOrder->warranty_expires_at->isFuture());

        return Inertia::render('app/orders/edit-order', [
            'order' => $order,
            'orderparts' => $order->orderParts,
            'orderPayments' => $order->orderPayments,
            'paymentSummary' => $paymentSummary,
            'customers' => $customers,
            'technicals' => $technicals,
            'equipments' => $equipments,
            'parts' => $parts,
            'models' => $models,
            'equipmentHistory' => [
                'total_previous_orders' => $equipmentHistory->count(),
                'has_recurrence' => $equipmentHistory->isNotEmpty(),
                'same_defect_count' => $equipmentHistory->filter(function (Order $historyOrder) use ($order) {
                    return strcasecmp(trim((string) $historyOrder->defect), trim((string) $order->defect)) === 0;
                })->count(),
                'active_warranty' => $activeWarrantyOrder ? [
                    'order_number' => $activeWarrantyOrder->order_number,
                    'warranty_expires_at' => $activeWarrantyOrder->warranty_expires_at?->toIso8601String(),
                ] : null,
                'is_warranty_return' => (bool) $order->is_warranty_return,
                'warranty_source_order' => $warrantySourceOrder ? [
                    'order_number' => $warrantySourceOrder->order_number,
                    'warranty_expires_at' => $warrantySourceOrder->warranty_expires_at?->toIso8601String(),
                ] : null,
                'history' => $equipmentHistory,
            ],
            'page' => $request->page,
            'search' => $request->search,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order, Request $request)
    {
        abort_unless($this->canAccessOrder($order), 403);

        return redirect()->route('app.orders.show', [
            'order' => $order->id,
            'page' => $request->page,
            'search' => $request->search,
            'open_payments' => $request->get('open_payments'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(OrderRequest $request, Order $order): RedirectResponse
    {
        abort_unless($this->canAccessOrder($order), 403);

        $data = $request->all();
        $request->validated();
        $data['budget_value'] = $this->normalizeMoneyValue($data['budget_value'] ?? 0);
        $data['parts_value'] = $this->normalizeMoneyValue($data['parts_value'] ?? 0);
        $data['service_value'] = $this->normalizeMoneyValue($data['service_value'] ?? 0);
        $data['service_cost'] = $this->normalizeMoneyValue($data['service_cost'] ?? 0);
        $warrantyDays = isset($data['warranty_days']) && $data['warranty_days'] !== '' ? max(0, (int) $data['warranty_days']) : null;
        $deliveryDate = ! empty($data['delivery_date']) ? Carbon::parse($data['delivery_date']) : null;
        $warrantyExpiresAt = $deliveryDate && $warrantyDays ? $deliveryDate->copy()->addDays($warrantyDays) : null;
        $warrantySourceOrder = $this->detectWarrantyReturn(
            isset($data['customer_id']) ? (int) $data['customer_id'] : null,
            isset($data['equipment_id']) ? (int) $data['equipment_id'] : null,
            isset($data['model']) ? (string) $data['model'] : null,
            (int) $order->id,
        );
        $oldStatus = $order->service_status;
        $currentPartsSnapshot = $order->orderParts()
            ->get(['parts.id'])
            ->mapWithKeys(fn ($part) => [(int) $part->id => (int) ($part->pivot->quantity ?? 0)])
            ->toArray();
        $successMessage = 'Ordem atualizada com sucesso';

        if (! OrderStatus::canTransition($oldStatus, $data['service_status'])) {
            return back()->withErrors([
                'service_status' => sprintf(
                    'Transição inválida de status: %s para %s.',
                    OrderStatus::label($oldStatus),
                    OrderStatus::label($data['service_status'])
                ),
            ]);
        }

        $order->update([
            'customer_id' => $data['customer_id'],
            'equipment_id' => $data['equipment_id'], // equipamento
            'user_id' => $data['user_id'], // equipamento
            'model' => $data['model'],
            'password' => $data['password'],
            'defect' => $data['defect'],
            'state_conservation' => $data['state_conservation'], // estado de conservação
            'accessories' => $data['accessories'],
            'budget_description' => $data['budget_description'] ?? null,
            'budget_value' => $data['budget_value'] ?? 0,
            'services_performed' => $data['services_performed'], // servicos executados
            'parts_value' => $data['parts_value'] ?? 0,
            'service_value' => $data['service_value'] ?? 0,
            'service_cost' => $data['service_cost'] ?? 0, // custo
            'delivery_date' => $data['delivery_date'], // $data de entrega
            'warranty_days' => $warrantyDays,
            'warranty_expires_at' => $warrantyExpiresAt,
            'is_warranty_return' => (bool) $warrantySourceOrder,
            'warranty_source_order_id' => $warrantySourceOrder?->id,
            'service_status' => $data['service_status'],
            'delivery_forecast' => $data['delivery_forecast'], // previsao de entrega
            'observations' => $data['observations'],
        ]);
        $changes = collect($order->getChanges())
            ->except(['updated_at'])
            ->toArray();

        if (isset($data['allparts'])) {
            $partsToSync = [];
            foreach ($data['allparts'] as $part) {
                $partsToSync[$part['part_id']] = ['quantity' => $part['quantity']];
            }
            // 2. Sincroniza as peças à Ordem de Serviço usando a tabela pivô
            $order->orderParts()->sync($partsToSync);

            $nextPartsSnapshot = collect($partsToSync)
                ->mapWithKeys(fn ($part, $partId) => [(int) $partId => (int) ($part['quantity'] ?? 0)])
                ->toArray();

            if ($currentPartsSnapshot !== $nextPartsSnapshot) {
                $this->logOrderAction($order, 'parts_synced', [
                    'items_count' => count($nextPartsSnapshot),
                    'total_quantity' => array_sum($nextPartsSnapshot),
                ]);
            }
        }

        if ($data['service_status'] != $oldStatus) {
            $currentStatus = (int) $data['service_status'];
            $statusLabel = OrderStatus::label($currentStatus);

            $this->recordStatusHistory($order, $currentStatus);
            $this->logOrderAction($order, 'status_changed', [
                'from' => (int) $oldStatus,
                'from_label' => OrderStatus::label($oldStatus),
                'to' => $currentStatus,
                'to_label' => $statusLabel,
                'changes' => $changes,
            ]);

            $customerEmail = $order->customer?->email;

            if ($this->shouldSendCustomerMailer($order, $customerEmail)) {
                try {
                    TenantMailConfig::applyForTenantId($order->tenant_id ? (int) $order->tenant_id : null);
                    Mail::to($customerEmail)->send(
                        new OrderStatusUpdatedMail(
                            $order->fresh(['customer', 'tenant']),
                            $statusLabel,
                            $data['observations'] ?? null
                        )
                    );
                } catch (\Throwable $e) {
                    report($e);
                    $successMessage = 'Ordem atualizada com sucesso, mas houve falha ao enviar o e-mail de status ao cliente.';
                }
            }
        } elseif ($changes !== []) {
            $this->logOrderAction($order, 'updated', [
                'changes' => $changes,
            ]);
        }

        return redirect()->route('app.orders.show', ['order' => $order->id])->with('success', $successMessage);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        abort_unless($this->canManageOrders() && $this->canAccessOrder($order), 403);

        $order->delete();
        $order->orderParts()->detach();

        return redirect()->route('app.orders.index')->with('success', 'Ordem excluída com sucesso');
    }

    public function removePart(Request $request)
    {
        abort_unless($this->canManageOrders(), 403);

        $validatedData = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'part_id' => 'required|integer|exists:parts,id',
        ]);

        $order = Order::find($validatedData['order_id']);
        abort_unless($order && $this->canAccessOrder($order), 403);

        $order->load('orderParts');
        $part = $order->orderParts->firstWhere('id', (int) $validatedData['part_id']);

        if (! $part) {
            return back()->with('error', 'A peça informada não está vinculada a esta ordem.');
        }

        $removedQuantity = (float) ($part->pivot?->quantity ?? 1);
        $removedTotal = $this->roundMoney((float) ($part->sale_price ?? 0) * $removedQuantity);
        $nextPartsValue = $this->roundMoney(max(0, (float) ($order->parts_value ?? 0) - $removedTotal));
        $nextServiceValue = $this->roundMoney((float) ($order->service_value ?? 0));
        $nextServiceCost = $this->roundMoney($nextPartsValue + $nextServiceValue);

        $order->orderParts()->detach($validatedData['part_id']);
        $order->update([
            'parts_value' => $nextPartsValue,
            'service_cost' => $nextServiceCost,
        ]);
        $this->logOrderAction($order, 'part_removed', [
            'part_id' => (int) $part->id,
            'part_name' => $part->name,
            'quantity_removed' => $removedQuantity,
            'removed_total' => $removedTotal,
        ]);

        return redirect()->route('app.orders.show', $order)->with('success', 'Peça removida e estoque devolvido com sucesso.');
    }

    public function storePayment(Request $request, Order $order): RedirectResponse
    {
        abort_unless($this->canManageOrders(), 403);
        abort_unless($this->canAccessOrder($order), 403);

        $request->merge([
            'amount' => $this->normalizeMoneyFloat($request->input('amount')),
        ]);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:pix,cartao,dinheiro,transferencia,boleto',
            'paid_at' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $order->load('orderPayments');
        $paymentSummary = $this->buildPaymentSummary($order);
        $amount = $this->roundMoney((float) $validated['amount']);

        if ($amount > $paymentSummary['remaining']) {
            return back()->withErrors([
                'amount' => 'O valor informado é maior que o saldo restante da ordem.',
            ]);
        }

        $openCashSessionId = CashSession::query()
            ->where('status', 'open')
            ->latest('opened_at')
            ->value('id');

        if (! $openCashSessionId) {
            return back()->withErrors([
                'amount' => 'Abra o caixa diário antes de registrar pagamento da ordem.',
            ]);
        }

        $payment = OrderPayment::create([
            'order_id' => $order->id,
            'cash_session_id' => $openCashSessionId,
            'amount' => $amount,
            'payment_method' => $validated['payment_method'],
            'paid_at' => $validated['paid_at'] ?? now(),
            'notes' => $validated['notes'] ?? null,
        ]);
        $this->logOrderAction($order, 'payment_registered', [
            'payment_id' => $payment->id,
            'cash_session_id' => $openCashSessionId,
            'amount' => $amount,
            'payment_method' => $validated['payment_method'],
            'paid_at' => $payment->paid_at?->toDateTimeString(),
        ]);

        return back()->with('success', 'Pagamento registrado com sucesso.');
    }

    public function destroyPayment(Order $order, OrderPayment $payment): RedirectResponse
    {
        abort_unless($this->canManageOrders(), 403);
        abort_unless($this->canAccessOrder($order), 403);
        abort_unless((int) $payment->order_id === (int) $order->id, 404);

        if ($payment->cashSession?->status === 'closed') {
            return back()->with('error', 'Não é possível remover pagamento vinculado a um caixa já fechado.');
        }

        $paymentData = [
            'payment_id' => $payment->id,
            'cash_session_id' => $payment->cash_session_id,
            'amount' => (float) $payment->amount,
            'payment_method' => $payment->payment_method,
            'paid_at' => $payment->paid_at?->toDateTimeString(),
        ];
        $payment->delete();
        $this->logOrderAction($order, 'payment_removed', $paymentData);

        return back()->with('success', 'Pagamento removido com sucesso.');
    }

    public function paymentsData(Order $order)
    {
        abort_unless($this->canAccessOrder($order), 403);

        $order->load('customer');
        $orderPayments = $order->orderPayments()->latest('paid_at')->get();
        $order->setRelation('orderPayments', $orderPayments);
        $paymentSummary = $this->buildPaymentSummary($order);

        return response()->json([
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'can_send_payment_reminder' => $this->shouldSendCustomerMailer($order, $order->customer?->email),
            ],
            'orderPayments' => $orderPayments,
            'paymentSummary' => $paymentSummary,
        ]);
    }

    public function registerFiscal(Request $request, Order $order): RedirectResponse
    {
        abort_unless($this->canManageOrders(), 403);
        abort_unless($this->canAccessOrder($order), 403);

        $validated = $request->validate([
            'fiscal_document_number' => 'required|string|max:120',
            'fiscal_document_url' => 'nullable|url|max:500',
            'fiscal_issued_at' => 'nullable|date',
            'fiscal_notes' => 'nullable|string|max:2000',
        ]);

        $fiscalDocumentKey = $order->fiscal_document_key;

        if (empty($fiscalDocumentKey)) {
            $fiscalDocumentKey = hash('sha256', implode('|', [
                (string) $order->id,
                (string) now()->timestamp,
                (string) $validated['fiscal_document_number'],
            ]));
        }

        $order->update([
            'fiscal_document_number' => $validated['fiscal_document_number'],
            'fiscal_document_key' => $fiscalDocumentKey,
            'fiscal_document_url' => $validated['fiscal_document_url'] ?? null,
            'fiscal_issued_at' => $validated['fiscal_issued_at'] ?? now(),
            'fiscal_registered_by' => Auth::id(),
            'fiscal_notes' => $validated['fiscal_notes'] ?? null,
        ]);
        $this->logOrderAction($order, 'fiscal_registered', [
            'fiscal_document_number' => $validated['fiscal_document_number'],
            'fiscal_document_url' => $validated['fiscal_document_url'] ?? null,
            'fiscal_issued_at' => $validated['fiscal_issued_at'] ?? now()->toDateTimeString(),
        ]);

        return back()->with('success', 'Comprovante fiscal da ordem registrado com sucesso.');
    }

    public function sendPaymentReminder(Order $order): RedirectResponse
    {
        abort_unless($this->canManageOrders(), 403);
        abort_unless($this->canAccessOrder($order), 403);

        $order->load('customer', 'orderPayments');
        $paymentSummary = $this->buildPaymentSummary($order);

        if ((float) ($paymentSummary['total_order'] ?? 0) <= 0) {
            return back()->with('error', 'Defina os valores financeiros da ordem antes de enviar lembrete.');
        }

        if ((float) ($paymentSummary['remaining'] ?? 0) <= 0) {
            return back()->with('success', 'Esta ordem já está quitada, nenhum lembrete foi enviado.');
        }

        if (empty($order->delivery_date)) {
            return back()->with('error', 'O lembrete só pode ser enviado após a entrega do equipamento.');
        }

        $customerEmail = trim((string) ($order->customer?->email ?? ''));

        if (! $this->shouldSendCustomerMailer($order, $customerEmail)) {
            return back()->with('error', 'Envio indisponível: cliente sem e-mail válido ou SMTP do cliente não configurado.');
        }

        $isOverdue = false;
        if (! empty($order->delivery_date)) {
            $isOverdue = Carbon::parse($order->delivery_date)->lt(now()->subDays(7));
        }

        try {
            TenantMailConfig::applyForTenantId($order->tenant_id ? (int) $order->tenant_id : null);
            Mail::to($customerEmail)->send(new OrderPaymentReminderMail($order, $paymentSummary, $isOverdue));
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Falha ao enviar o e-mail de cobrança. Verifique a configuração SMTP e tente novamente.');
        }

        return back()->with('success', 'E-mail de cobrança/lembrete enviado com sucesso.');
    }

    public function markFeedback(Order $order)
    {
        abort_unless($this->canManageOrders(), 403);
        abort_unless($this->canAccessOrder($order), 403);

        $startDate = Carbon::now()->subDays(10)->startOfDay();
        $endDate = Carbon::now()->subDays(7)->endOfDay();

        if ((int) $order->service_status !== OrderStatus::DELIVERED || ! $order->delivery_date) {
            return back()->with('error', 'Esta ordem não está elegível para feedback.');
        }

        $deliveryDate = Carbon::parse($order->delivery_date);
        $isInWindow = $deliveryDate->betweenIncluded($startDate, $endDate);

        if (! $isInWindow) {
            return back()->with('error', 'A janela de feedback desta ordem já expirou ou ainda não foi iniciada.');
        }

        if ((bool) $order->feedback) {
            return back()->with('success', 'Feedback já foi marcado como realizado.');
        }

        $order->update(['feedback' => 1]);
        $this->logOrderAction($order, 'feedback_marked', [
            'feedback' => 1,
            'delivery_date' => Carbon::parse($order->delivery_date)->toDateTimeString(),
        ]);

        return back()->with('success', 'Feedback marcado como realizado.');
    }
}
