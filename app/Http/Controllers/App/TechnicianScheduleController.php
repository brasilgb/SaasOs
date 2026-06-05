<?php

namespace App\Http\Controllers\App;

use App\Events\OrderPaymentRegistered;
use App\Http\Controllers\Controller;
use App\Models\App\Image as OrderImage;
use App\Models\App\Schedule;
use App\Models\User;
use App\Services\OrderPaymentService;
use Illuminate\Http\Request;

class TechnicianScheduleController extends Controller
{
    public function __construct(private readonly OrderPaymentService $orderPaymentService) {}

    private function technician(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->canUseTechnicianApp(), 403);

        return $user;
    }

    private function schedulesQuery(User $technician)
    {
        return Schedule::query()
            ->with([
                'customer:id,name,email,phone,whatsapp,zipcode,state,city,district,street,number,complement,observations',
                'order:id,customer_id,equipment_id,user_id,order_number,tracking_token,model,defect,state_conservation,accessories,budget_description,budget_value,service_status,observations,services_performed,technician_diagnosis,technician_solution,technician_observations,technician_checklist_items,technician_checklist_completed_at,technician_attended_at,technician_local_payment_received,technician_local_payment_amount,technician_local_payment_method,technician_local_payment_notes,technician_local_payment_received_at,technician_local_payment_user_id,service_cost,delivery_forecast,delivery_date',
                'order.orderPayments:id,order_id,amount,payment_method,paid_at,notes',
                'order.equipment:id,equipment_number,equipment',
                'order.equipment.checklists:id,equipment_id,checklist',
                'user:id,name,email,telephone,whatsapp,avatar',
            ])
            ->where('user_id', $technician->id)
            ->where('send_to_technician', true)
            ->whereNotNull('order_id');
    }

    public function index(Request $request)
    {
        $technician = $this->technician($request);
        $data = $request->validate([
            'period' => ['nullable', 'string', 'in:today,tomorrow,week,pending,overdue,completed'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = $this->schedulesQuery($technician)
            ->when(($data['period'] ?? null) === 'today', fn ($query) => $query->whereDate('schedules', today()))
            ->when(($data['period'] ?? null) === 'tomorrow', fn ($query) => $query->whereDate('schedules', today()->addDay()))
            ->when(($data['period'] ?? null) === 'week', fn ($query) => $query->whereBetween('schedules', [now()->startOfDay(), now()->addDays(7)->endOfDay()]))
            ->when(($data['period'] ?? null) === 'pending', fn ($query) => $query->whereIn('status', [1, 2]))
            ->when(($data['period'] ?? null) === 'overdue', fn ($query) => $query->whereIn('status', [1, 2])->where('schedules', '<', now()->startOfDay()))
            ->when(($data['period'] ?? null) === 'completed', fn ($query) => $query->where('status', 3))
            ->orderBy('schedules')
            ->orderBy('id');

        $schedules = $query
            ->paginate((int) ($data['per_page'] ?? 50))
            ->through(fn (Schedule $schedule) => $this->schedulePayload($schedule));

        return response()->json([
            'success' => true,
            'result' => $schedules,
        ]);
    }

    public function dashboard(Request $request)
    {
        $technician = $this->technician($request);
        $baseQuery = $this->schedulesQuery($technician);

        $nextSchedule = (clone $baseQuery)
            ->where('status', 1)
            ->where('schedules', '>=', now()->startOfDay())
            ->orderBy('schedules')
            ->orderBy('id')
            ->first();

        $currentSchedule = (clone $baseQuery)
            ->where('status', 2)
            ->orderBy('schedules')
            ->orderBy('id')
            ->first();

        return response()->json([
            'success' => true,
            'result' => [
                'summary' => [
                    'today' => (clone $baseQuery)->whereDate('schedules', today())->count(),
                    'pending' => (clone $baseQuery)->whereIn('status', [1, 2])->count(),
                    'in_progress' => (clone $baseQuery)->where('status', 2)->count(),
                    'overdue' => (clone $baseQuery)->whereIn('status', [1, 2])->where('schedules', '<', now()->startOfDay())->count(),
                    'completed' => (clone $baseQuery)->where('status', 3)->count(),
                ],
                'current_schedule' => $currentSchedule ? $this->schedulePayload($currentSchedule) : null,
                'next_schedule' => $nextSchedule ? $this->schedulePayload($nextSchedule) : null,
            ],
        ]);
    }

    public function show(Request $request, Schedule $schedule)
    {
        $technician = $this->technician($request);
        $schedule = $this->schedulesQuery($technician)
            ->whereKey($schedule->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'result' => $this->schedulePayload($schedule),
        ]);
    }

    public function updateStatus(Request $request, Schedule $schedule)
    {
        $technician = $this->technician($request);
        $data = $request->validate([
            'status' => ['required', 'integer', 'in:1,2,3'],
        ]);

        $schedule = $this->schedulesQuery($technician)
            ->whereKey($schedule->id)
            ->firstOrFail();

        if ((int) $data['status'] === 1) {
            abort_if($schedule->check_in_at, 422, 'Não é possível reverter um atendimento com check-in registrado.');
        }

        if ((int) $data['status'] === 3) {
            abort_unless($schedule->check_in_at, 422, 'Registre o check-in antes de finalizar o atendimento.');
        }

        $schedule->update([
            'status' => $data['status'],
        ]);

        return response()->json([
            'success' => true,
            'result' => $this->schedulePayload($schedule->refresh()->loadMissing([
                'customer',
                'order',
                'order.equipment',
                'user',
            ])),
        ]);
    }

    public function checkIn(Request $request, Schedule $schedule)
    {
        $technician = $this->technician($request);
        $data = $request->validate([
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'observations' => ['nullable', 'string', 'max:1000'],
        ]);

        $schedule = $this->schedulesQuery($technician)
            ->whereKey($schedule->id)
            ->firstOrFail();

        abort_if((int) $schedule->status === 3 || $schedule->check_out_at, 422, 'Atendimento ja finalizado.');
        abort_if($schedule->check_in_at, 422, 'Check-in ja registrado para este atendimento.');

        $schedule->update([
            'status' => 2,
            'check_in_at' => now(),
            'check_in_latitude' => $data['latitude'] ?? null,
            'check_in_longitude' => $data['longitude'] ?? null,
            'check_in_observations' => $data['observations'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'result' => $this->freshSchedulePayload($schedule),
        ]);
    }

    public function checkOut(Request $request, Schedule $schedule)
    {
        $technician = $this->technician($request);
        $data = $request->validate([
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'observations' => ['nullable', 'string', 'max:1000'],
        ]);

        $schedule = $this->schedulesQuery($technician)
            ->whereKey($schedule->id)
            ->firstOrFail();

        abort_if((int) $schedule->status === 3 || $schedule->check_out_at, 422, 'Atendimento ja finalizado.');
        abort_unless($schedule->check_in_at, 422, 'Registre o check-in antes do check-out.');

        $checklistItems = $schedule->order?->equipment?->checklists
            ->flatMap(fn ($checklist) => collect(explode(',', (string) $checklist->checklist))
                ->map(fn ($item) => trim($item))
                ->filter())
            ->values()
            ->all() ?? [];

        if ($checklistItems !== []) {
            $completedItems = $schedule->order?->technician_checklist_items ?? [];

            abort_unless(
                empty(array_diff($checklistItems, $completedItems)),
                422,
                'Conclua e salve o checklist antes de finalizar o atendimento.'
            );
        }

        abort_unless(
            filled($schedule->order?->technician_diagnosis) && filled($schedule->order?->technician_solution),
            422,
            'Salve o diagnóstico e a solução antes de finalizar o atendimento.'
        );

        $schedule->update([
            'status' => 3,
            'check_out_at' => now(),
            'check_out_latitude' => $data['latitude'] ?? null,
            'check_out_longitude' => $data['longitude'] ?? null,
            'check_out_observations' => $data['observations'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'result' => $this->freshSchedulePayload($schedule),
        ]);
    }

    public function updateReport(Request $request, Schedule $schedule)
    {
        $technician = $this->technician($request);
        $data = $request->validate([
            'technician_diagnosis' => ['nullable', 'string', 'max:2000'],
            'technician_solution' => ['nullable', 'string', 'max:2000'],
            'technician_observations' => ['nullable', 'string', 'max:2000'],
        ]);

        $schedule = $this->schedulesQuery($technician)
            ->whereKey($schedule->id)
            ->firstOrFail();

        $order = $schedule->order;
        abort_unless($order, 404);

        $order->update([
            'technician_diagnosis' => $data['technician_diagnosis'] ?? null,
            'technician_solution' => $data['technician_solution'] ?? null,
            'technician_observations' => $data['technician_observations'] ?? null,
            'technician_attended_at' => $order->technician_attended_at ?? now(),
        ]);

        return response()->json([
            'success' => true,
            'result' => $this->freshSchedulePayload($schedule),
        ]);
    }

    public function updateChecklist(Request $request, Schedule $schedule)
    {
        $technician = $this->technician($request);
        $data = $request->validate([
            'items' => ['present', 'array'],
            'items.*' => ['string', 'max:500'],
        ]);

        $schedule = $this->schedulesQuery($technician)
            ->whereKey($schedule->id)
            ->firstOrFail();

        $order = $schedule->order;
        abort_unless($order, 404);

        $availableItems = $order->equipment?->checklists
            ->flatMap(fn ($checklist) => collect(explode(',', (string) $checklist->checklist))
                ->map(fn ($item) => trim($item))
                ->filter())
            ->values()
            ->all() ?? [];

        $items = collect($data['items'])
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->unique()
            ->when($availableItems !== [], fn ($items) => $items->intersect($availableItems))
            ->values()
            ->all();

        $order->update([
            'technician_checklist_items' => $items,
            'technician_checklist_completed_at' => count($items) > 0 ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'result' => $this->freshSchedulePayload($schedule),
        ]);
    }

    public function recordPayment(Request $request, Schedule $schedule)
    {
        $technician = $this->technician($request);
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'string', 'in:pix,cartao,dinheiro,transferencia'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $schedule = $this->schedulesQuery($technician)
            ->whereKey($schedule->id)
            ->firstOrFail();

        $order = $schedule->order;
        abort_unless($order, 404);

        $payment = $this->orderPaymentService->register($order, [
            'amount' => round((float) $data['amount'], 2),
            'payment_method' => $data['payment_method'],
            'paid_at' => now(),
            'notes' => $data['notes'] ?? null,
        ]);

        $order->update([
            'technician_local_payment_received' => true,
            'technician_local_payment_amount' => $payment->amount,
            'technician_local_payment_method' => $payment->payment_method,
            'technician_local_payment_notes' => $payment->notes,
            'technician_local_payment_received_at' => $payment->paid_at,
            'technician_local_payment_user_id' => $technician->id,
        ]);

        event(new OrderPaymentRegistered($order->id, $technician->id, [
            'payment_id' => $payment->id,
            'cash_session_id' => $payment->cash_session_id,
            'amount' => (float) $payment->amount,
            'payment_method' => $payment->payment_method,
            'paid_at' => $payment->paid_at?->toDateTimeString(),
        ]));

        return response()->json([
            'success' => true,
            'result' => $this->freshSchedulePayload($schedule),
        ]);
    }

    private function freshSchedulePayload(Schedule $schedule): array
    {
        return $this->schedulePayload($schedule->refresh()->loadMissing([
            'customer',
            'order',
            'order.equipment',
            'user',
        ]));
    }

    private function schedulePayload(Schedule $schedule): array
    {
        $customer = $schedule->customer;
        $order = $schedule->order;
        $equipment = $order?->equipment;
        $address = $customer ? collect([
            $customer->street,
            $customer->number,
            $customer->district,
            $customer->city,
            $customer->state,
        ])->filter(fn ($item) => filled($item))->implode(', ') : null;
        $phoneDigits = $customer ? preg_replace('/\D+/', '', (string) $customer->phone) : '';
        $whatsappDigits = $customer ? preg_replace('/\D+/', '', (string) $customer->whatsapp) : '';
        $whatsappNumber = $whatsappDigits && strlen($whatsappDigits) <= 11 ? '55'.$whatsappDigits : $whatsappDigits;
        $imagesCount = $order ? OrderImage::where('order_id', $order->id)->count() : 0;

        return [
            'id' => $schedule->id,
            'tenant_id' => $schedule->tenant_id,
            'schedules_number' => $schedule->schedules_number,
            'schedules' => $schedule->schedules,
            'service' => $schedule->service,
            'details' => $schedule->details,
            'status' => $schedule->status,
            'status_label' => $this->statusLabel((int) $schedule->status),
            'observations' => $schedule->observations,
            'send_to_technician' => (bool) $schedule->send_to_technician,
            'available_actions' => [
                'can_update_status' => (int) $schedule->status !== 3,
                'can_check_in' => (int) $schedule->status !== 3 && ! $schedule->check_in_at,
                'can_check_out' => (int) $schedule->status !== 3 && filled($schedule->check_in_at) && ! $schedule->check_out_at,
                'can_finish' => (int) $schedule->status !== 3 && filled($schedule->check_in_at) && ! $schedule->check_out_at,
                'can_cancel' => false,
                'can_edit_service' => (bool) $order,
                'can_record_local_payment' => (bool) $order,
                'can_upload_images' => (bool) $order && $imagesCount < 4,
                'remaining_images' => max(0, 4 - $imagesCount),
            ],
            'check_in' => [
                'at' => $schedule->check_in_at,
                'latitude' => $schedule->check_in_latitude,
                'longitude' => $schedule->check_in_longitude,
                'observations' => $schedule->check_in_observations,
            ],
            'check_out' => [
                'at' => $schedule->check_out_at,
                'latitude' => $schedule->check_out_latitude,
                'longitude' => $schedule->check_out_longitude,
                'observations' => $schedule->check_out_observations,
            ],
            'customer' => $customer ? [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'whatsapp' => $customer->whatsapp,
                'address' => [
                    'zipcode' => $customer->zipcode,
                    'state' => $customer->state,
                    'city' => $customer->city,
                    'district' => $customer->district,
                    'street' => $customer->street,
                    'number' => $customer->number,
                    'complement' => $customer->complement,
                ],
                'observations' => $customer->observations,
                'quick_actions' => [
                    'phone_url' => $phoneDigits ? 'tel:'.$phoneDigits : null,
                    'whatsapp_url' => $whatsappNumber ? 'https://wa.me/'.$whatsappNumber : null,
                    'maps_url' => $address ? 'https://www.google.com/maps/search/?api=1&query='.urlencode($address) : null,
                ],
            ] : null,
            'order' => $order ? [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'tracking_token' => $order->tracking_token,
                'model' => $order->model,
                'defect' => $order->defect,
                'state_conservation' => $order->state_conservation,
                'accessories' => $order->accessories,
                'budget_description' => $order->budget_description,
                'budget_value' => $order->budget_value,
                'service_status' => $order->service_status,
                'observations' => $order->observations,
                'services_performed' => $order->services_performed,
                'technician_diagnosis' => $order->technician_diagnosis,
                'technician_solution' => $order->technician_solution,
                'technician_observations' => $order->technician_observations,
                'technician_checklist_items' => $order->technician_checklist_items ?? [],
                'technician_checklist_completed_at' => $order->technician_checklist_completed_at,
                'technician_attended_at' => $order->technician_attended_at,
                'technician_local_payment_received' => (bool) $order->technician_local_payment_received,
                'technician_local_payment_amount' => $order->technician_local_payment_amount,
                'technician_local_payment_method' => $order->technician_local_payment_method,
                'technician_local_payment_notes' => $order->technician_local_payment_notes,
                'technician_local_payment_received_at' => $order->technician_local_payment_received_at,
                'service_cost' => $order->service_cost,
                'delivery_forecast' => $order->delivery_forecast,
                'delivery_date' => $order->delivery_date,
                'order_payments' => $order->orderPayments->map(fn ($payment) => [
                    'id' => $payment->id,
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'paid_at' => $payment->paid_at,
                    'notes' => $payment->notes,
                ])->values(),
                'equipment' => $equipment ? [
                    'id' => $equipment->id,
                    'equipment_number' => $equipment->equipment_number,
                    'equipment' => $equipment->equipment,
                    'checklist_items' => $equipment->checklists
                        ->flatMap(fn ($checklist) => collect(explode(',', (string) $checklist->checklist))
                            ->map(fn ($item) => trim($item))
                            ->filter())
                        ->values(),
                ] : null,
            ] : null,
            'technician' => $schedule->user ? [
                'id' => $schedule->user->id,
                'name' => $schedule->user->name,
                'email' => $schedule->user->email,
                'telephone' => $schedule->user->telephone,
                'whatsapp' => $schedule->user->whatsapp,
                'avatar' => $schedule->user->avatar,
                'avatar_url' => $schedule->user->avatar ? asset(ltrim($schedule->user->avatar, '/')) : null,
            ] : null,
            'created_at' => $schedule->created_at,
            'updated_at' => $schedule->updated_at,
        ];
    }

    private function statusLabel(int $status): string
    {
        return match ($status) {
            1 => 'Aberta',
            2 => 'Em atendimento',
            3 => 'Fechada',
            default => 'Desconhecido',
        };
    }
}
