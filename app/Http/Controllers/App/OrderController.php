<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Mail\OrderCreatedMail;
use App\Mail\OrderStatusUpdatedMail;
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\CashSession;
use App\Models\App\Order;
use App\Models\App\OrderPayment;
use App\Models\App\OrderStatusHistory;
use App\Models\App\Part;
use App\Models\App\WhatsappMessage;
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
        abort_unless(Auth::user()?->hasPermission('orders'), 403);
    }

    private function canManageOrders(): bool
    {
        $user = Auth::user();

        return $user?->hasPermission('orders') && ! $user->isTechnician();
    }

    private function canAccessOrder(Order $order): bool
    {
        $user = Auth::user();

        if (! $user?->hasPermission('orders')) {
            return false;
        }

        if (! $user->isTechnician()) {
            return true;
        }

        return (int) $order->user_id === (int) $user->id;
    }

    private function scopeOrdersQuery($query)
    {
        $user = Auth::user();

        if ($user?->isTechnician()) {
            $query->where('user_id', $user->id);
        }

        return $query;
    }

    // Display and linting order for id
    public function allOrder()
    {
        $this->authorizeOrdersAccess();

        $dashData = [
            'numorder' => $this->scopeOrdersQuery(Order::query())->count(),
            'numabertas' => $this->scopeOrdersQuery(Order::where('service_status', 1))->count(), // aberta
            'numgerados' => $this->scopeOrdersQuery(Order::where('service_status', 3))->count(), // orc. gerado
            'numaprovados' => $this->scopeOrdersQuery(Order::where('service_status', 4))->count(), // orc. aprovado
            'numconcluidosca' => $this->scopeOrdersQuery(Order::where('service_status', 9))->count(), // concluido cli nao avisado
            'numconcluidoscn' => $this->scopeOrdersQuery(Order::where('service_status', 7))->count(), // concluido cli avisado
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
                ->whereNotIn('service_status', [2, 8, 10])
                ->whereBetween('delivery_forecast', [$today->toDateString(), $tomorrow->toDateString()]);
        } elseif ($filter === 'feedback') {
            $query->where('service_status', 10)
                ->whereBetween('delivery_date', [$startDate, $endDate]);
        } elseif ($filter === 'financial_open') {
            $query->whereRaw(
                '(COALESCE(orders.service_cost, 0) - COALESCE((SELECT SUM(op.amount) FROM order_payments op WHERE op.order_id = orders.id), 0)) > 0.009'
            );
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', $search)
                    ->orWhereHas('customer', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', "%$search%")
                            ->orWhere('cpfcnpj', 'like', '%'.$search.'%');
                    });
            });
        }

        $orders = $query->with('equipment', 'customer')->paginate(11)->withQueryString();
        $whats = WhatsappMessage::first();

        $feedbackOrders = Order::where('service_status', 10)
            ->whereBetween('delivery_date', [$startDate, $endDate])
            ->get('order_number');

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
        $order = Order::create($data);

        $order->load(['customer', 'tenant']);
        $customerEmail = $order->customer?->email;

        if (! empty($customerEmail) && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
            Mail::to($customerEmail)->send(new OrderCreatedMail($order));
        }

        return redirect()->route('app.orders.index')->with('success', 'Ordem cadastrada com sucesso');
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
        $oldStatus = $order->service_status;
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
            'service_status' => $data['service_status'],
            'delivery_forecast' => $data['delivery_forecast'], // previsao de entrega
            'observations' => $data['observations'],
        ]);

        if (isset($data['allparts'])) {
            $partsToSync = [];
            foreach ($data['allparts'] as $part) {
                $partsToSync[$part['part_id']] = ['quantity' => $part['quantity']];
            }
            // 2. Sincroniza as peças à Ordem de Serviço usando a tabela pivô
            $order->orderParts()->sync($partsToSync);
        }

        $notes = [
            1 => 'Ordem Aberta',
            2 => 'Ordem Fechada',
            3 => 'Orçamento Gerado',
            4 => 'Orçamento Aprovado',
            5 => 'Reparo em andamento',
            6 => 'Serviço concluído',
            7 => 'Cliente avisado / aguardando retirada',
            8 => 'Entregue ao cliente',
            9 => 'Orçamento recusado',
            10 => 'Serviço não executado',
        ];

        if ($data['service_status'] != $oldStatus) {
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => $data['service_status'],
                'changed_by' => Auth::id(),
                'note' => $notes[$data['service_status']] ?? null,
            ]);

            $customerEmail = $order->customer?->email;

            if (! empty($customerEmail) && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                Mail::to($customerEmail)->send(
                    new OrderStatusUpdatedMail(
                        $order->fresh(['customer', 'tenant']),
                        $notes[$data['service_status']] ?? 'Status atualizado',
                        $data['observations'] ?? null
                    )
                );
            }
        }

        return redirect()->route('app.orders.show', ['order' => $order->id])->with('success', 'Ordem atualizada com sucesso');
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
        // 1. Desvincula a peça da Ordem de Serviço na tabela pivô
        $order->orderParts()->detach($validatedData['part_id']);
        $order->update(['parts_value' => 0, 'service_value' => 0, 'service_cost' => 0]);
        $order->orderParts()->detach();

        return redirect()->route('app.orders.show', $order)->with('success', 'Peça removida e estoque devolvido com sucesso.');
    }

    public function storePayment(Request $request, Order $order): RedirectResponse
    {
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
            return back()->with('error', 'Abra o caixa diário antes de registrar pagamento da ordem.');
        }

        OrderPayment::create([
            'order_id' => $order->id,
            'cash_session_id' => $openCashSessionId,
            'amount' => $amount,
            'payment_method' => $validated['payment_method'],
            'paid_at' => $validated['paid_at'] ?? now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Pagamento registrado com sucesso.');
    }

    public function destroyPayment(Order $order, OrderPayment $payment): RedirectResponse
    {
        abort_unless($this->canAccessOrder($order), 403);
        abort_unless((int) $payment->order_id === (int) $order->id, 404);

        $payment->delete();

        return back()->with('success', 'Pagamento removido com sucesso.');
    }

    public function paymentsData(Order $order)
    {
        abort_unless($this->canAccessOrder($order), 403);

        $order->load('orderPayments');
        $paymentSummary = $this->buildPaymentSummary($order);

        return response()->json([
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
            ],
            'orderPayments' => $order->orderPayments,
            'paymentSummary' => $paymentSummary,
        ]);
    }

    public function getFeedback(Request $request)
    {
        abort_unless($this->canManageOrders(), 403);

        $feedback = $request->get('feedback');
        $orderid = $request->get('orderid');
        $order = Order::findOrFail($orderid);
        abort_unless($this->canAccessOrder($order), 403);
        $order->update(['feedback' => $feedback]);
        response()->json([
            'success' => true,
        ]);
    }
}
