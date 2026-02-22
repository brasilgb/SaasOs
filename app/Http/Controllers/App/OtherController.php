<?php

namespace App\Http\Controllers\App;

use App\Models\App\Company;
use App\Http\Controllers\Controller;
use App\Models\App\Customer;
use App\Models\App\Order;
use App\Models\App\Other;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OtherController extends Controller
{
    public function index()
    {
        if (Other::get()->isEmpty()) {
            Other::create();
        }
        $query = Other::orderBy("id", "DESC")->first();
        $othersettings = Other::where("id", $query->id)->first();
        $company = Company::first();
        $expiresAt = Carbon::parse(Tenant::first()->expires_at);
        $diff = Carbon::now()->diff($expiresAt);
        $time_remaining = ', restante ' . $diff->days . ' dias e ' . $diff->h . ' horas';
        return Inertia::render('app/others/index', ['othersettings' => $othersettings, 'company' => $company, 'time_remaining' => $time_remaining]);
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
