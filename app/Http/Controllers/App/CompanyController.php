<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Company;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class CompanyController extends Controller
{
    private function currentTenantId(): ?int
    {
        return Auth::user()?->tenant_id ? (int) Auth::user()->tenant_id : null;
    }

    public function getEmpresaInfo()
    {
        $empresa = Company::query()
            ->where('tenant_id', $this->currentTenantId())
            ->first();

        return response()->json([
            'success' => true,
            'data' => $empresa,
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Company $company)
    {
        Gate::authorize('company.access');

        $tenantId = $this->currentTenantId();
        $company = Company::query()->firstOrCreate([
            'tenant_id' => $tenantId,
        ]);

        return Inertia::render('app/company/index', ['company' => $company]);
    }

    /**
     * Display the specified resource.
     */
    public function update(Request $request, Company $company): RedirectResponse
    {
        Gate::authorize('company.access');
        abort_if((int) $company->tenant_id !== (int) $this->currentTenantId(), 403);

        $data = $request->all();
        $storePath = public_path('storage/logos');
        if ($request->hasfile('logo')) {
            $fileName = time().'.'.$request->logo->extension();
            $request->logo->move($storePath, $fileName);
            if (file_exists($storePath.DIRECTORY_SEPARATOR.$company->logo && $company->logo)) {
                unlink($storePath.DIRECTORY_SEPARATOR.$company->logo);
            }
        }
        $data['logo'] = $request->hasfile('logo') ? $fileName : $company->logo;
        Model::reguard();
        $company->update($data);

        $tenant = Tenant::query()->find($company->tenant_id);
        if ($tenant) {
            $tenant->update($data);
        }
        Model::unguard();

        return redirect()->route('app.company.index')->with('success', 'Dados da filial alterados com sucesso!');
    }
}
