<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\ScheduleRequest;
use App\Models\App\Customer;
use App\Models\App\Order;
use App\Models\App\Other;
use App\Models\App\Schedule;
use App\Models\User;
use App\Services\TechnicianPushNotificationService;
use App\Support\TenantSequence;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    private function currentTenantId(): ?int
    {
        return Auth::user()?->tenant_id ? (int) Auth::user()->tenant_id : null;
    }

    private function scheduleTenantId(array $data, ?Schedule $schedule = null): ?int
    {
        if ($schedule?->tenant_id) {
            return (int) $schedule->tenant_id;
        }

        foreach (['customer_id' => Customer::class, 'order_id' => Order::class, 'user_id' => User::class] as $field => $model) {
            if (empty($data[$field])) {
                continue;
            }

            $tenantId = $model::withoutGlobalScopes()
                ->whereKey($data[$field])
                ->value('tenant_id');

            if ($tenantId) {
                return (int) $tenantId;
            }
        }

        return $this->currentTenantId();
    }

    private function scopeSchedulesQuery($query)
    {
        $user = Auth::user();

        if ($user?->isTechnician()) {
            $query->where('user_id', $user->id);
        }

        return $query;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Schedule::class);

        $status = $request->status;
        $search = $request->search;

        $query = $this->scopeSchedulesQuery(Schedule::query())->orderBy('id', 'DESC');

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('schedules_number', $search)
                    ->orWhere('service', 'like', '%'.$search.'%')
                    ->orWhereHas('customer', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', "%$search%")
                            ->orWhere('cpfcnpj', 'like', '%'.$search.'%');
                    });
            });
        }
        $schedules = $query
            ->with([
                'user',
                'customer',
                'order.images:id,order_id',
                'order.equipment.checklists:id,equipment_id,checklist',
                'order.orderPayments:id,order_id,amount',
            ])
            ->paginate(11)
            ->through(fn (Schedule $schedule) => $this->scheduleIndexPayload($schedule))
            ->withQueryString();

        return Inertia::render('app/schedules/index', [
            'schedules' => $schedules,
            'search' => $search,
            'status' => $status,
            'tab' => $request->tab,
        ]);
    }

    private function scheduleIndexPayload(Schedule $schedule): array
    {
        $order = $schedule->order;
        $checklistItems = collect($order?->equipment?->checklists ?? [])
            ->flatMap(fn ($checklist) => collect(explode(',', (string) $checklist->checklist))
                ->map(fn ($item) => trim($item))
                ->filter())
            ->values()
            ->all();
        $completedChecklistItems = $order?->technician_checklist_items ?? [];
        $checklistCompleted = $checklistItems === [] || empty(array_diff($checklistItems, $completedChecklistItems));

        return [
            ...$schedule->toArray(),
            'customer' => $schedule->customer,
            'user' => $schedule->user,
            'order' => $order,
            'mobile_summary' => [
                'sent_to_technician' => (bool) $schedule->send_to_technician,
                'has_check_in' => filled($schedule->check_in_at),
                'has_check_out' => filled($schedule->check_out_at),
                'has_report' => filled($order?->technician_diagnosis) && filled($order?->technician_solution),
                'has_checklist' => $checklistItems !== [],
                'checklist_completed' => $checklistCompleted,
                'checklist_items' => $checklistItems,
                'checklist_completed_items' => $completedChecklistItems,
                'images_count' => $order?->images?->count() ?? 0,
                'local_payment_received' => (bool) $order?->technician_local_payment_received,
                'payments_count' => $order?->orderPayments?->count() ?? 0,
            ],
        ];
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Schedule::class);

        $customers = Customer::get();
        $orders = Order::query()
            ->orderByDesc('id')
            ->get(['id', 'customer_id', 'order_number', 'model', 'defect', 'service_status']);
        $enableTechnicianScheduleNotifications = Other::technicianScheduleNotificationsEnabled($this->currentTenantId());
        $technicals = User::whereIn('roles', [User::ROLE_TECHNICIAN, User::ROLE_ADMIN])
            ->where('status', 1)
            ->get();

        return Inertia::render('app/schedules/create-schedule', [
            'customers' => $customers,
            'orders' => $orders,
            'technicals' => $technicals,
            'enableTechnicianScheduleNotifications' => $enableTechnicianScheduleNotifications,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ScheduleRequest $request): RedirectResponse
    {
        $this->authorize('create', Schedule::class);

        $data = $request->all();
        $request->validated();
        Customer::query()->whereKey($data['customer_id'])->firstOrFail();
        Order::query()
            ->whereKey($data['order_id'])
            ->where('customer_id', $data['customer_id'])
            ->firstOrFail();
        User::query()->whereKey($data['user_id'])->firstOrFail();
        if (! Other::technicianScheduleNotificationsEnabled($this->scheduleTenantId($data))) {
            $data['send_to_technician'] = false;
        }
        $data['schedules_number'] = TenantSequence::next(Schedule::class, 'schedules_number');
        $schedule = Schedule::create($data);
        $this->notifyTechnicianIfNeeded($schedule);

        return redirect()->route('app.schedules.index')->with('success', 'Agenda cadastrada com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(Schedule $schedule, Request $request)
    {
        $this->authorize('view', $schedule);

        $schedule->load([
            'user',
            'customer',
            'order.images',
            'order.equipment.checklists',
            'order.orderPayments',
        ]);

        $customers = Customer::get();
        $orders = Order::query()
            ->orderByDesc('id')
            ->get(['id', 'customer_id', 'order_number', 'model', 'defect', 'service_status']);
        $enableTechnicianScheduleNotifications = Other::technicianScheduleNotificationsEnabled($this->currentTenantId());
        $technicals = User::whereIn('roles', [User::ROLE_TECHNICIAN, User::ROLE_ADMIN])
            ->where('status', 1)
            ->get();

        return Inertia::render('app/schedules/edit-schedule', [
            'schedule' => $this->scheduleIndexPayload($schedule),
            'customers' => $customers,
            'orders' => $orders,
            'technicals' => $technicals,
            'enableTechnicianScheduleNotifications' => $enableTechnicianScheduleNotifications,
            'page' => $request->page,
            'search' => $request->search,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Schedule $schedule, Request $request)
    {
        $this->authorize('view', $schedule);

        return redirect()->route('app.schedules.show', [
            'schedule' => $schedule->id,
            'page' => $request->page,
            'search' => $request->search,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ScheduleRequest $request, Schedule $schedule): RedirectResponse
    {
        $this->authorize('update', $schedule);

        $data = $request->all();
        $request->validated();
        Customer::query()->whereKey($data['customer_id'])->firstOrFail();
        Order::query()
            ->whereKey($data['order_id'])
            ->where('customer_id', $data['customer_id'])
            ->firstOrFail();
        User::query()->whereKey($data['user_id'])->firstOrFail();
        if (! Other::technicianScheduleNotificationsEnabled($this->scheduleTenantId($data, $schedule))) {
            $data['send_to_technician'] = false;
        }
        $wasSentToTechnician = (bool) $schedule->send_to_technician;
        $schedule->update($data);

        if (! $wasSentToTechnician || $schedule->wasChanged(['user_id', 'schedules', 'service', 'customer_id'])) {
            $this->notifyTechnicianIfNeeded($schedule);
        }

        return redirect()->route('app.schedules.show', ['schedule' => $schedule->id])->with('success', 'Agenda editada com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Schedule $schedule)
    {
        $this->authorize('delete', $schedule);

        $schedule->loadMissing('order.orderPayments');

        $order = $schedule->order;
        if ($order && (
            $order->orderPayments->isNotEmpty()
            || $order->technician_local_payment_received
            || $order->technician_attended_at
            || $schedule->check_in_at
            || $schedule->check_out_at
        )) {
            return redirect()->route('app.schedules.index')->with(
                'error',
                'Não é possível excluir este agendamento porque ele possui atendimento técnico ou pagamento registrado na OS vinculada.'
            );
        }

        $schedule->delete();

        return redirect()->route('app.schedules.index')->with('success', 'Agenda excluida com sucesso');
    }

    private function notifyTechnicianIfNeeded(Schedule $schedule): void
    {
        if (! $schedule->send_to_technician) {
            return;
        }

        Log::info('Disparando notificação de agendamento para técnico responsável.', [
            'schedule_id' => $schedule->id,
            'sender_user_id' => Auth::id(),
            'recipient_user_id' => $schedule->user_id,
            'tenant_id' => $schedule->tenant_id,
        ]);

        app(TechnicianPushNotificationService::class)->notifyScheduleSent($schedule->fresh(['customer']));
    }
}
