<?php

namespace App\Http\Controllers\App;

use App\Events\OrderCreated;
use App\Events\OrderLifecycleCreated;
use App\Events\OrderLifecycleStatusChanged;
use App\Events\OrderPaymentRegistered;
use App\Events\OrderPaymentRemoved;
use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Models\App\Other;
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\FiscalDocument;
use App\Models\App\CashSession;
use App\Models\App\Order;
use App\Models\App\OrderLog;
use App\Models\App\OrderPayment;
use App\Models\App\OrderStatusHistory;
use App\Models\App\Part;
use App\Models\App\WhatsappMessage;
use App\Services\OrderStatusService;
use App\Services\OrderPaymentService;
use App\Services\OrderNotificationService;
use App\Services\OperationalAuditService;
use App\Support\OrderStatus;
use App\Support\TenantSequence;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(
        private readonly OperationalAuditService $operationalAuditService,
        private readonly OrderPaymentService $orderPaymentService,
        private readonly OrderStatusService $orderStatusService,
        private readonly OrderNotificationService $orderNotificationService,
    ) {}

    private function shouldSendCustomerMailer(Order $order, ?string $customerEmail): bool
    {
        $email = trim((string) ($customerEmail ?? ''));
        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        return $this->orderNotificationService->canSendToCustomer($order, $customerEmail);
    }

    private function appendPaymentReminderAvailability(Order $order): Order
    {
        $order->setAttribute(
            'can_send_payment_reminder',
            $this->shouldSendCustomerMailer($order, $order->customer?->email)
        );
        $order->setAttribute(
            'can_send_budget_follow_up',
            (int) $order->service_status === OrderStatus::BUDGET_GENERATED
                && $this->shouldSendCustomerMailer($order, $order->customer?->email)
        );

        return $order;
    }

    private function latestCommunicationLog(Order $order): ?OrderLog
    {
        if ($order->relationLoaded('logs')) {
            return $order->logs
                ->whereIn('action', ['payment_reminder_sent', 'budget_follow_up_sent'])
                ->sortByDesc('created_at')
                ->first();
        }

        return $order->logs()
            ->whereIn('action', ['payment_reminder_sent', 'budget_follow_up_sent'])
            ->latest('created_at')
            ->first();
    }

    private function appendLastCommunication(Order $order): Order
    {
        $log = $this->latestCommunicationLog($order);

        if (! $log) {
            $order->setAttribute('last_communication', null);

            return $order;
        }

        $data = is_array($log->data) ? $log->data : [];

        $order->setAttribute('last_communication', [
            'action' => $log->action,
            'trigger' => $data['trigger'] ?? null,
            'channel' => $data['channel'] ?? null,
            'recipient' => $data['recipient'] ?? null,
            'is_overdue' => (bool) ($data['is_overdue'] ?? false),
            'created_at' => $log->created_at?->toIso8601String(),
        ]);

        return $order;
    }

    private function communicationThresholdDays(): int
    {
        return Other::communicationFollowUpCooldownDays($this->currentUser()?->tenant_id);
    }

    private function customerFeedbackRequestThreshold(): Carbon
    {
        $delay = Other::customerFeedbackRequestDelayDays($this->currentUser()?->tenant_id);

        return Carbon::now()->subDays($delay)->endOfDay();
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

        return $this->appendLastCommunication($order);
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

    private function logOperationalAudit(string $action, Order $order, array $data = []): void
    {
        $this->operationalAuditService->record($action, 'order', $order, $this->currentUser()?->id, $data);
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
        $this->authorize('viewAny', Order::class);

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
        $this->authorize('viewAny', Order::class);

        $query = $this->scopeOrdersQuery(Order::where('order_number', $order))->with('customer')->with('equipment')->get();

        return [
            'success' => true,
            'result' => $query,
        ];
    }

    // Display and listing customers for id order
    public function getOrderCli($customer)
    {
        $this->authorize('viewAny', Order::class);

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
        $this->authorize('viewAny', Order::class);

        $feedbackThreshold = $this->customerFeedbackRequestThreshold();

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
            ->whereNotNull('delivery_date')
            ->where('delivery_date', '<=', $feedbackThreshold)
            ->whereNull('customer_feedback_submitted_at')
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
        $this->authorize('create', Order::class);

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
        $this->authorize('create', Order::class);

        $data = $request->validated();
        Customer::query()->whereKey($data['customer_id'])->firstOrFail();
        Equipment::query()->whereKey($data['equipment_id'])->firstOrFail();
        $tenantId = (int) ($this->currentUser()?->tenant_id ?? 0);
        $data['order_number'] = TenantSequence::next(Order::class, 'order_number', $tenantId);
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
        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => (int) $order->service_status,
            'changed_by' => $this->currentUser()?->id,
            'note' => OrderStatus::label((int) $order->service_status),
        ]);
        event(new OrderLifecycleCreated($order->id, $this->currentUser()?->id, [
            'status' => (int) $order->service_status,
            'status_label' => OrderStatus::label($order->service_status),
            'customer_id' => $order->customer_id,
            'equipment_id' => $order->equipment_id,
            'is_warranty_return' => (bool) $order->is_warranty_return,
            'warranty_source_order_number' => $warrantySourceOrder?->order_number,
        ]));

        $successMessage = 'Ordem cadastrada com sucesso';

        try {
            event(new OrderCreated($order));
        } catch (\Throwable $e) {
            report($e);
            $successMessage = 'Ordem cadastrada com sucesso, mas houve falha ao enviar o e-mail ao cliente.';
        }

        $shouldShowLabelButton = $tenantId > 0
            ? (bool) Other::query()
                ->where('tenant_id', $tenantId)
                ->value('print_label_button_after_order_create')
            : false;

        if ($shouldShowLabelButton) {
            return redirect()
                ->route('app.orders.create')
                ->with('success', $successMessage)
                ->with('label_print', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'print_url' => route('app.label-printing.print', [
                        'initialorder' => $order->order_number,
                        'quantity' => 1,
                        'format' => 'thermal',
                    ]),
                ]);
        }

        return redirect()->route('app.orders.index')->with('success', $successMessage);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order, Request $request)
    {
        $this->authorize('view', $order);

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

        $technicals = User::whereIn('roles', [User::ROLE_TECHNICIAN, User::ROLE_ADMIN])
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
        $this->authorize('view', $order);

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
        $this->authorize('update', $order);

        $data = $request->all();
        $request->validated();
        Customer::query()->whereKey($data['customer_id'])->firstOrFail();
        Equipment::query()->whereKey($data['equipment_id'])->firstOrFail();
        User::query()->whereKey($data['user_id'])->firstOrFail();
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
            'service_status' => $oldStatus,
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

            try {
                $order = $this->orderStatusService->transition($order, $currentStatus, $this->currentUser()?->id);
            } catch (\Illuminate\Validation\ValidationException $exception) {
                return back()->withErrors($exception->errors());
            }
            $statusChangeData = [
                'from' => (int) $oldStatus,
                'from_label' => OrderStatus::label($oldStatus),
                'to' => $currentStatus,
                'to_label' => $statusLabel,
                'changes' => $changes,
            ];
            event(new OrderLifecycleStatusChanged(
                $order->id,
                $this->currentUser()?->id,
                $statusChangeData,
                $statusChangeData,
            ));

            try {
                event(new OrderStatusUpdated($order->fresh(['customer', 'tenant']), $statusLabel, $data['observations'] ?? null));
            } catch (\Throwable $e) {
                report($e);
                $successMessage = 'Ordem atualizada com sucesso, mas houve falha ao enviar o e-mail de status ao cliente.';
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
        $this->authorize('delete', $order);

        $order->delete();
        $order->orderParts()->detach();

        return redirect()->route('app.orders.index')->with('success', 'Ordem excluída com sucesso');
    }

    public function removePart(Request $request)
    {
        $this->authorize('create', Order::class);

        $validatedData = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'part_id' => 'required|integer|exists:parts,id',
        ]);

        $order = Order::find($validatedData['order_id']);
        abort_unless($order, 404);
        $this->authorize('update', $order);

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
        $this->authorize('update', $order);

        $request->merge([
            'amount' => $this->normalizeMoneyFloat($request->input('amount')),
        ]);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:pix,cartao,dinheiro,transferencia,boleto',
            'paid_at' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $payment = $this->orderPaymentService->register($order, [
            ...$validated,
            'amount' => $this->roundMoney((float) $validated['amount']),
        ]);
        $paymentEventData = [
            'payment_id' => $payment->id,
            'cash_session_id' => $payment->cash_session_id,
            'amount' => (float) $payment->amount,
            'payment_method' => $validated['payment_method'],
            'paid_at' => $payment->paid_at?->toDateTimeString(),
        ];
        event(new OrderPaymentRegistered($order->id, $this->currentUser()?->id, $paymentEventData));

        return back()->with('success', 'Pagamento registrado com sucesso.');
    }

    public function destroyPayment(Order $order, OrderPayment $payment): RedirectResponse
    {
        $this->authorize('update', $order);
        abort_unless((int) $payment->order_id === (int) $order->id, 404);

        try {
            $paymentData = $this->orderPaymentService->remove($payment);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        event(new OrderPaymentRemoved($order->id, $this->currentUser()?->id, $paymentData));

        return back()->with('success', 'Pagamento removido com sucesso.');
    }

    public function paymentsData(Order $order)
    {
        $this->authorize('view', $order);

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
        $this->authorize('update', $order);

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

        FiscalDocument::updateOrCreate(
            [
                'documentable_type' => Order::class,
                'documentable_id' => $order->id,
                'provider' => 'manual',
            ],
            [
                'tenant_id' => $order->tenant_id,
                'type' => 'nfse',
                'number' => $validated['fiscal_document_number'],
                'access_key' => $fiscalDocumentKey,
                'status' => 'registered',
                'pdf_url' => $validated['fiscal_document_url'] ?? null,
                'issued_at' => $validated['fiscal_issued_at'] ?? now(),
                'registered_by' => Auth::id(),
                'notes' => $validated['fiscal_notes'] ?? null,
            ]
        );

        $this->logOrderAction($order, 'fiscal_registered', [
            'fiscal_document_number' => $validated['fiscal_document_number'],
            'fiscal_document_url' => $validated['fiscal_document_url'] ?? null,
            'fiscal_issued_at' => $validated['fiscal_issued_at'] ?? now()->toDateTimeString(),
        ]);

        return back()->with('success', 'Comprovante fiscal da ordem registrado com sucesso.');
    }

    public function sendPaymentReminder(Order $order): RedirectResponse
    {
        $this->authorize('update', $order);

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
            $this->orderNotificationService->sendPaymentReminder($order, $paymentSummary, $isOverdue);
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Falha ao enviar o e-mail de cobrança. Verifique a configuração SMTP e tente novamente.');
        }

        $this->logOrderAction($order, 'payment_reminder_sent', [
            'channel' => 'email',
            'recipient' => $customerEmail,
            'remaining' => (float) ($paymentSummary['remaining'] ?? 0),
            'is_overdue' => $isOverdue,
            'trigger' => 'manual',
        ]);

        return back()->with('success', 'E-mail de cobrança/lembrete enviado com sucesso.');
    }

    public function sendBudgetFollowUp(Order $order): RedirectResponse
    {
        $this->authorize('update', $order);

        $order->load('customer', 'tenant');

        if ((int) $order->service_status !== OrderStatus::BUDGET_GENERATED) {
            return back()->with('error', 'O follow-up de orçamento só pode ser enviado quando a ordem estiver com orçamento gerado.');
        }

        $customerEmail = trim((string) ($order->customer?->email ?? ''));

        if (! $this->shouldSendCustomerMailer($order, $customerEmail)) {
            return back()->with('error', 'Envio indisponível: cliente sem e-mail válido ou SMTP do cliente não configurado.');
        }

        $daysPending = $this->communicationDaysPending($order);

        try {
            $this->orderNotificationService->sendBudgetFollowUp($order, $daysPending);
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Falha ao enviar o follow-up do orçamento. Verifique a configuração SMTP e tente novamente.');
        }

        $this->logOrderAction($order, 'budget_follow_up_sent', [
            'channel' => 'email',
            'recipient' => $customerEmail,
            'days_pending' => $daysPending,
            'trigger' => 'manual',
        ]);

        return back()->with('success', 'Follow-up de orçamento enviado com sucesso.');
    }

    public function markFeedback(Order $order)
    {
        $this->authorize('update', $order);

        $feedbackThreshold = $this->customerFeedbackRequestThreshold();

        if ((int) $order->service_status !== OrderStatus::DELIVERED || ! $order->delivery_date) {
            return back()->with('error', 'Esta ordem não está elegível para feedback.');
        }

        $deliveryDate = Carbon::parse($order->delivery_date);
        $isInWindow = $deliveryDate->lte($feedbackThreshold);

        if (! $isInWindow) {
            return back()->with('error', 'Esta ordem ainda não está elegível para feedback.');
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
