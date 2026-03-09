<?php

namespace App\Http\Controllers\App;

use App\Models\App\Customer;
use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class CustomerController extends Controller
{

public function ImportCustomer(Request $request)
{
    try {
        $request->validate([
            'arquivo' => 'required|mimes:csv,txt|max:2048'
        ], [
            'arquivo.required' => 'Por favor, selecione um arquivo.',
            'arquivo.mimes' => 'O arquivo deve ser do tipo CSV ou TXT.',
        ]);

        $tenantId = Auth::user()->tenant_id;
        $path = $request->file('arquivo')->getRealPath();
        $file = fopen($path, 'r');

        // Detectar delimitador automaticamente
        $firstLine = fgets($file);
        rewind($file);

        $delimiters = [",", ";", "|"];
        $delimiter = ",";

        $maxCount = 0;
        foreach ($delimiters as $d) {
            $count = substr_count($firstLine, $d);
            if ($count > $maxCount) {
                $maxCount = $count;
                $delimiter = $d;
            }
        }

        // Pula cabeçalho
        fgetcsv($file, 1000, $delimiter);

        $ultimoNumero = \App\Models\App\Customer::where('tenant_id', $tenantId)
            ->max('customer_number') ?? 0;

        $dadosParaInserir = [];

        while (($linha = fgetcsv($file, 1000, $delimiter)) !== false) {

            if (empty($linha[0])) continue;

            $ultimoNumero++;

            $dadosParaInserir[] = [
                'tenant_id'       => $tenantId,
                'customer_number' => $ultimoNumero,
                'name'            => $linha[0],
                'cpfcnpj'         => $linha[1] ?? null,
                'birth'           => $linha[2] ?? null,
                'email'           => $linha[3] ?? null,
                'zipcode'         => $linha[4] ?? null,
                'state'           => $linha[5] ?? null,
                'city'            => $linha[6] ?? null,
                'district'        => $linha[7] ?? null,
                'street'          => $linha[8] ?? null,
                'complement'      => $linha[9] ?? null,
                'number'          => $linha[10] ?? null,
                'phone'           => $linha[11] ?? null,
                'contactname'     => $linha[12] ?? null,
                'whatsapp'        => $linha[13] ?? null,
                'contactphone'    => $linha[14] ?? null,
                'observations'    => $linha[15] ?? null,
                'created_at'      => now(),
                'updated_at'      => now(),
            ];

            if (count($dadosParaInserir) >= 500) {
                \App\Models\App\Customer::insertOrIgnore($dadosParaInserir);
                $dadosParaInserir = [];
            }
        }

        if (!empty($dadosParaInserir)) {
            \App\Models\App\Customer::insertOrIgnore($dadosParaInserir);
        }

        fclose($file);

        return redirect()->back()->with('message', 'Importação concluída com sucesso!');
    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Falha na importação: ' . $e->getMessage());
    }
}

    public function getClientes()
    {
        $clientes = Customer::get();
        return [
            "success" => true,
            "result" => $clientes
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');

        $query = Customer::orderBy('id', 'DESC');

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%')
                ->orWhere('cpfcnpj', 'like', '%' . $search . '%');
        }

        $customers = $query->paginate(11);
        $customerlast = Customer::orderBy('id', 'DESC')->first();
        return Inertia::render('app/customers/index', ["customers" => $customers, "customerlast" => $customerlast]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('app/customers/create-customer');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CustomerRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $data['customer_number'] = Customer::exists() ? Customer::latest()->first()->customer_number + 1 : 1;
        Customer::create($data);
        return redirect()->route('app.customers.index')->with('success', 'Cliente cadastrado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        return Inertia::render('app/customers/edit-customer', ['customer' => $customer]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        return Redirect::route('app.customers.show', ['customer' => $customer->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CustomerRequest $request, Customer $customer): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $customer->update($data);
        return redirect()->route('app.customers.show', ['customer' => $customer->id])->with('success', 'Cliente alterado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->route('app.customers.index')->with('success', 'Cliente excluido com sucesso!');
    }
}
