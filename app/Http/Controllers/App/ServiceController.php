<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceRequest;
use App\Models\App\Equipment;
use App\Models\App\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ServiceController extends Controller
{
    private function authorizeServiceSettingsAccess(): void
    {
        abort_unless(Auth::user()?->hasPermission('settings'), 403);
    }

    public function getServicos(Request $request)
    {
        $this->authorizeServiceSettingsAccess();

        $servicos = Service::where('equipamento', $request->equipamento)->get();

        return response()->json([
            'success' => true,
            'data' => $servicos,
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorizeServiceSettingsAccess();

        $search = $request->search;
        $query = Service::with('equipment')->orderBy('id', 'DESC');
        if ($search) {
            $query->where('service', 'like', '%'.$search.'%');
        }
        $services = $query->paginate(11);
        $equipments = Equipment::get();

        return Inertia::render('app/services/index', ['services' => $services, 'equipments' => $equipments]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ServiceRequest $request): RedirectResponse
    {
        $this->authorizeServiceSettingsAccess();

        $data = $request->all();
        $request->validated();
        $data['service_number'] = Service::exists() ? Service::latest()->first()->service_number + 1 : 1;
        Service::create($data);

        return redirect()->route('app.register-services.index')->with('success', 'Serviço cadastrado com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(Service $service)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Service $service)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ServiceRequest $request, Service $service): RedirectResponse
    {
        $this->authorizeServiceSettingsAccess();

        $data = $request->all();
        $request->validated();
        $service->update($data);

        return redirect()->route('app.register-services.index')->with('success', 'Serviço editado com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $service): RedirectResponse
    {
        $this->authorizeServiceSettingsAccess();

        $service->delete();

        return redirect()->route('app.register-services.index')->with('success', 'Serviço excluido com sucesso!');
    }
}
