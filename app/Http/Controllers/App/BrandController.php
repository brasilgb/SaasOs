<?php

namespace App\Http\Controllers\App;

use App\Models\App\Brand;
use App\Http\Controllers\Controller;
use App\Http\Requests\BrandRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BrandController extends Controller
{

    public function getMarcas()
    {
        $marcas = Brand::get();
        return response()->json([
            "success" => true,
            "data" => $marcas
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');
        $query = Brand::orderBy('id', 'DESC');
        if ($search) {
            $query->where('brand', 'like', '%' . $search . '%');
        }
        $brands = $query->paginate(12);
        return Inertia::render('app/brands/index', ['brands' => $brands]);
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
    public function store(BrandRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $data['brand_number'] = Brand::exists() ? Brand::latest()->first()->brand_number + 1 : 1;
        Brand::create($data);
        return redirect()->route('app.register-brands.index')->with('success', 'Marca cadastrada com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(Brand $brand)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Brand $brand)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(BrandRequest $request, Brand $brand): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $data['order_number'] = Brand::exists() ? Brand::latest()->first()->brand_number + 1 : 1;
        $brand->update($data);
        return redirect()->route('app.register-brands.index')->with('success', 'Marca editada com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Brand $brand)
    {
        $brand->delete();
        return redirect()->route('app.register-brands.index')->with('success', 'Marca excluida com sucesso!');
    }
}
