<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    
    public function getEmpresaInfo()
    {
        $empresa = Company::first();
        return response()->json([
            "success" => true,
            "data" => $empresa
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Company $company)
    {
        if (Company::get()->isEmpty()) {
            $data['id'] = '1';
            Company::create(['id' => '1']);
        }
        $query = Company::orderBy("id", "DESC")->first();
        $company = Company::where("id", $query->id)->first();

        return Inertia::render('company/index', ["company" => $company]);
    }

    /**
     * Display the specified resource.
     */
    public function update(Request $request, Company $company): RedirectResponse
    {
        $data = $request->all();
        $storePath = public_path('storage/logos');
        if ($request->hasfile('logo')) {
            $fileName = time() . '.' . $request->logo->extension();
            $request->logo->move($storePath, $fileName);
            if (file_exists($storePath . DIRECTORY_SEPARATOR . $company->logo && $company->logo)) {
                unlink($storePath . DIRECTORY_SEPARATOR . $company->logo);
            }
        }
        $data['logo'] = $request->hasfile('logo') ? $fileName : $company->logo;
        Model::reguard();
        $company->update($data);
        Model::unguard();
        return redirect()->route('company.index')->with('success', 'Dados da company alterados com sucesso!');
    }
}
