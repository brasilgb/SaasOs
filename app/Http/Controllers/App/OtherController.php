<?php

namespace App\Http\Controllers\App;

use App\Models\App\Company;
use App\Http\Controllers\Controller;
use App\Models\App\Customer;
use App\Models\App\Order;
use App\Models\App\Other;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OtherController extends Controller
{
    public function index()
    {
        if (Other::get()->isEmpty()) {
            Other::create(['id' => '1']);
        }
        $query = Other::orderBy("id", "DESC")->first();
        $othersettings = Other::where("id", $query->id)->first();
        $customers = Customer::get(["id", "name", "cpf", "email"]);
        $orders = Order::get();
        $company = Company::first();
        return Inertia::render('app/others/index', ['othersettings' => $othersettings, 'customers' => $customers, 'orders' => $orders, 'company' => $company]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Other $other): RedirectResponse
    {
        $data = $request->all();
        $other->update($data);
        return redirect()->route('app.other-settings.index', ['other' => $other->id])->with('success', 'Configurações alteradas com sucesso');
    }
}
