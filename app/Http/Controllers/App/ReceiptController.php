<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Checklist;
use App\Models\App\Company;
use App\Models\App\Order;
use App\Models\App\Receipt;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ReceiptController extends Controller
{
    private function currentTenantId(): ?int
    {
        return Auth::user()?->tenant_id ? (int) Auth::user()->tenant_id : null;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        Gate::authorize('receipts.access');

        $receipt = Receipt::query()->latest('id')->first() ?? Receipt::create();

        return Inertia::render('app/receipts/index', ['receipt' => $receipt]);
    }

    public function update(Request $request, Receipt $receipt): RedirectResponse
    {
        Gate::authorize('receipts.access');

        $data = $request->validate([
            'receivingequipment' => ['nullable', 'string'],
            'equipmentdelivery' => ['nullable', 'string'],
            'budgetissuance' => ['nullable', 'string'],
        ]);

        $receipt->update($data);

        return redirect()->route('app.receipts.index', ['receipts' => $receipt->id])->with('success', 'Recibos editados com sucesso');
    }

    public function printing($or, $tp)
    {
        Gate::authorize('receipts.access');

        $order = Order::where('id', $or)->with(['customer', 'equipment', 'orderParts'])->firstOrFail();
        $this->authorize('view', $order);
        $company = Company::query()
            ->where('tenant_id', $this->currentTenantId())
            ->first();
        $receipt = Receipt::first();
        $checklist = Checklist::where('equipment_id', $order->equipment_id)->first('checklist');

        return Inertia::render('app/receipts/print-receipt', ['order' => $order, 'type' => $tp, 'company' => $company, 'receipt' => $receipt, 'checklist' => $checklist]);
    }
}
