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
use Inertia\Inertia;

class ReceiptController extends Controller
{
    private function authorizeReceiptsAccess(): void
    {
        abort_unless(Auth::user()?->hasPermission('receipts'), 403);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Receipt $receipt)
    {
        $this->authorizeReceiptsAccess();

        if (Receipt::get()->isEmpty()) {
            Receipt::create();
        }
        $query = Receipt::orderBy('id', 'DESC')->first();
        $receipt = Receipt::where('id', $query->id)->first();

        return Inertia::render('app/receipts/index', ['receipt' => $receipt]);
    }

    public function update(Request $request, Receipt $receipt): RedirectResponse
    {
        $this->authorizeReceiptsAccess();

        $data = $request->all();
        $receipt->update($data);

        return redirect()->route('app.receipts.index', ['receipts' => $receipt->id])->with('success', 'Recibos editados com sucesso');
    }

    public function printing($or, $tp)
    {
        $this->authorizeReceiptsAccess();

        $order = Order::where('id', $or)->with(['customer', 'equipment', 'orderParts'])->firstOrFail();
        $this->authorize('view', $order);
        $company = Company::first();
        $receipt = Receipt::first();
        $checklist = Checklist::where('equipment_id', $order->equipment_id)->first('checklist');

        return Inertia::render('app/receipts/print-receipt', ['order' => $order, 'type' => $tp, 'company' => $company, 'receipt' => $receipt, 'checklist' => $checklist]);
    }
}
