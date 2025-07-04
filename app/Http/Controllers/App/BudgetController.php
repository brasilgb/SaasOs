<?php

namespace App\Http\Controllers\App;

use App\Models\Budget;
use App\Http\Controllers\Controller;
use App\Http\Requests\BudgetsRequest;
use App\Models\Brand;
use App\Models\EQModel;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetController extends Controller
{

    public function getOrcamentos(Request $request)
    {
        if (!$request->marca && !$request->modelo) {
            $orcamento = Budget::where('servico', $request->servico)->first();
            $marcas = [];
            $modelos = [];
        } else {
            $orcamento = Budget::where('servico', $request->servico)->where('brand', $request->brand)->where('eqmodel', $request->eqmodel)->first();
            $marcas    = Brand::where('id', $request->brand)->first();
            $modelos   = EQModel::where('id', $request->eqmodel)->first();
        }

        $servicos  = Service::where('id', $request->servico)->first();

        return response()->json([
            'status' => true,
            'data' => [
                "id" =>  $orcamento->id,
                "servico" =>  $servicos->servico,
                "marca" =>  $marcas ? $marcas->marca : null,
                "modelo" =>  $modelos ? $modelos->modelo : null,
                "descricao" =>  $orcamento->descricao,
                "valor" =>  $orcamento->valor,
                "created_at" =>  $orcamento->created_at,
            ],
        ], 200);
    }
    
    /**
     * Display a listing of the resource.
     */
public function index(Request $request)
    {
        $search = $request->get('q');
        $query = Budget::with('brand')->with('eqmodel')->with('service')->orderBy('id', 'DESC');
        if ($search) {
            $query->where('title', 'like', '%' . $search . '%');
        }
        $budgets = $query->paginate(12)->withQueryString();
        $brands = Brand::get();
        $models = EQModel::get();
        $services = Service::get();
        return Inertia::render('app/budgets/index', ['budgets' => $budgets, 'brands' => $brands, 'models' => $models, 'services' => $services]);
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
    public function store(BudgetsRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $data['id'] = Budget::exists() ? Budget::latest()->first()->id + 1 : 1;
        Budget::create($data);
        return redirect()->route('register-budgets.index')->with('success', 'Orçamento cadastrado com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(Budget $budget)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Budget $budget)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(BudgetsRequest $request, Budget $budget): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $budget->update($data);
        return redirect()->route('register-budgets.index')->with('success', 'Orçamento editado com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Budget $budget)
    {
        $budget->delete();
        return redirect()->route('register-budgets.index')->with('success', 'Orçamento excluido com sucesso!');
    }
}
