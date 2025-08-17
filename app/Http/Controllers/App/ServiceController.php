<?php

namespace App\Http\Controllers\App;

use App\Models\App\Service;
use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceRequest;
use App\Models\App\Equipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{

    public function getServicos(Request $request)
    {
        $servicos = Service::where('equipamento', $request->equipamento)->get();
        return response()->json([
            "success" => true,
            "data" => $servicos
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');
        $query = Service::with('equipment')->orderBy('id', 'DESC');
        if ($search) {
            $query->where('service', 'like', '%' . $search . '%');
        }
        $services = $query->paginate(12);
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
        $data = $request->all();
        $request->validated();
        $data['id'] = Service::exists() ? Service::latest()->first()->id + 1 : 1;
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
        $service->delete();
        return redirect()->route('app.register-services.index')->with('success', 'Serviço excluido com sucesso!');
    }
}
