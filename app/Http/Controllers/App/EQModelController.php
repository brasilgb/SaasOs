<?php

namespace App\Http\Controllers\App;

use App\Models\App\EQModel;
use App\Http\Controllers\Controller;
use App\Http\Requests\EQModelRequest;
use App\Models\App\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EQModelController extends Controller
{

    public function getModelos(Request $request)
    {
        $modelos = EQModel::where('brand_id', $request->brand)->get();
        return response()->json([
            "success" => true,
            "data" => $modelos
        ]);
    }
    
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');
        $query = EQModel::with('brand')->orderBy('id', 'DESC');
        if ($search) {
            $query->where('model', 'like', '%' . $search . '%');
        }
        $models = $query->paginate(12);
        $brands = Brand::get();
        return Inertia::render('app/models/index', ['models' => $models, 'brands' => $brands]);
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
    public function store(EQModelRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $data['id'] = EQModel::exists() ? EQModel::latest()->first()->id + 1 : 1;
        EQModel::create($data);
        return redirect()->route('register-models.index')->with('success', 'Modelo cadastrado com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(EQModel $eQModel)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EQModel $eQModel)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(EQModelRequest $request, EQModel $eQModel): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $eQModel->update($data);
        return redirect()->route('register-models.index')->with('success', 'Modelo editado com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EQModel $eQModel)
    {
        $eQModel->delete();
        return redirect()->route('register-models.index')->with('success', 'Modelo excluido com sucesso!');
    }
}
