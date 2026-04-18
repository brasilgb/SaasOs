<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Company;
use App\Models\App\Other;
use App\Models\App\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class LabelPrintingController extends Controller
{
    private function currentTenantId(): ?int
    {
        return Auth::user()?->tenant_id ? (int) Auth::user()->tenant_id : null;
    }

    private function buildLabelsData(int $initial, int $totalLabels): array
    {
        $tenantId = $this->currentTenantId();
        $company = Company::query()
            ->where('tenant_id', $tenantId)
            ->first();
        $totalLabels = max(1, $totalLabels);
        $final = $initial + $totalLabels - 1;
        $data = [];
        $orders = Order::query()
            ->with('customer:id,name')
            ->where('tenant_id', $tenantId)
            ->whereBetween('order_number', [$initial, $final])
            ->get(['id', 'customer_id', 'order_number'])
            ->keyBy('order_number');

        for ($i = $initial; $i <= $final; $i++) {
            /** @var \App\Models\App\Order|null $order */
            $order = $orders->get($i);
            $data[] = [
                'order' => $i,
                'telephone' => $company?->telephone ?? '',
                'company' => $company?->shortname ?: ($company?->companyname ?? ''),
                'customer' => $order?->customer?->name ?? '',
                'barcode' => str_pad((string) $i, 8, '0', STR_PAD_LEFT),
            ];
        }

        return $data;
    }

    private function nextOrderNumber(): int
    {
        $tenantId = $this->currentTenantId();

        if (! $tenantId) {
            return 1;
        }

        return ((int) Order::query()
            ->where('tenant_id', $tenantId)
            ->max('order_number')) + 1;
    }

    public function index()
    {
        Gate::authorize('label-printing.access');

        $other = Other::query()->firstOrCreate([
            'tenant_id' => $this->currentTenantId(),
        ], [
            'print_label_button_after_order_create' => false,
        ]);

        return Inertia::render('app/label-printing/index', [
            'nextOrderNumber' => $this->nextOrderNumber(),
            'labelSettings' => [
                'other_id' => $other->id,
                'print_label_button_after_order_create' => (bool) $other->print_label_button_after_order_create,
            ],
        ]);
    }

    public function print(Request $request)
    {
        Gate::authorize('label-printing.access');

        $validated = $request->validate([
            'initialorder' => ['required', 'integer', 'min:1'],
            'pages' => ['nullable', 'integer', 'min:1'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:96'],
            'format' => ['nullable', 'string', 'in:a4,thermal'],
        ]);

        $quantity = isset($validated['quantity']) ? (int) $validated['quantity'] : null;
        $pages = isset($validated['pages']) ? max(1, (int) $validated['pages']) * 96 : null;
        $totalLabels = $quantity ?? $pages ?? 96;
        $data = $this->buildLabelsData((int) $validated['initialorder'], $totalLabels);

        return Inertia::render('app/label-printing/print-labels', [
            'data' => $data,
            'format' => $validated['format'] ?? 'a4',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('label-printing.access');

        return $this->print($request);
    }

    public function updateSettings(Request $request)
    {
        Gate::authorize('label-printing.access');

        $other = Other::query()->firstOrCreate([
            'tenant_id' => $this->currentTenantId(),
        ], [
            'print_label_button_after_order_create' => false,
        ]);

        $data = $request->validate([
            'print_label_button_after_order_create' => ['sometimes', 'boolean'],
        ]);

        $other->update($data);

        return back();
    }
}
