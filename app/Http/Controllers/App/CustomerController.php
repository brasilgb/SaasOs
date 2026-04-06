<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerRequest;
use App\Models\App\Customer;
use App\Models\App\Order;
use App\Models\App\OrderPayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class CustomerController extends Controller
{
    private function authorizeCustomersAccess(): void
    {
        abort_unless(Auth::user()?->hasPermission('customers'), 403);
    }

    // public function ImportCustomer(Request $request)
    // {
    //     try {
    //         $request->validate([
    //             'arquivo' => 'required|mimes:csv,txt|max:4096' // Aumentei um pouco o max para segurança
    //         ]);

    //         $tenantId = Auth::user()->tenant_id;
    //         $path = $request->file('arquivo')->getRealPath();
    //         $file = fopen($path, 'r');

    //         // Detectar delimitador... (seu código de detecção está ok)
    //         $firstLine = fgets($file);
    //         rewind($file);

    //         $delimiter = ";"; // Padrão comum no Brasil, mas sua lógica de detecção segue válida
    //         // ... (sua lógica de detecção aqui)

    //         fgetcsv($file, 0, $delimiter); // Pula cabeçalho - mudei 1000 para 0

    //         $ultimoNumero = \App\Models\App\Customer::where('tenant_id', $tenantId)->max('customer_number') ?? 0;
    //         $dadosParaInserir = [];
    //         $contadorSucesso = 0;
    //         $linhaAtual = 1;

    //         // Importante: fgetcsv com o segundo parâmetro como 0 (sem limite de comprimento de linha)
    //         while (($linha = fgetcsv($file, 0, $delimiter)) !== false) {
    //             $linhaAtual++;

    //             // Se a linha estiver vazia ou não tiver o nome (index 0), pula
    //             if (!isset($linha[0]) || empty(trim($linha[0]))) {
    //                 Log::warning("Linha {$linhaAtual} ignorada: Nome vazio ou linha inválida.");
    //                 continue;
    //             }

    //             $ultimoNumero++;

    //             $dadosParaInserir[] = [
    //                 'tenant_id'       => $tenantId,
    //                 'customer_number' => $ultimoNumero,
    //                 'name'            => mb_convert_encoding($linha[0], 'UTF-8', 'ISO-8859-1, UTF-8'), // Evita erro de encoding
    //                 'cpfcnpj'         => $linha[1] ?? null,
    //                 'email'           => $linha[3] ?? null,
    //                 // ... demais campos ...
    //                 'created_at'      => now(),
    //                 'updated_at'      => now(),
    //             ];

    //             if (count($dadosParaInserir) >= 100) { // Lotes menores (100) são melhores para debugar
    //                 \App\Models\App\Customer::insert($dadosParaInserir);
    //                 $contadorSucesso += count($dadosParaInserir);
    //                 $dadosParaInserir = [];
    //             }
    //         }

    //         if (!empty($dadosParaInserir)) {
    //             \App\Models\App\Customer::insert($dadosParaInserir);
    //             $contadorSucesso += count($dadosParaInserir);
    //         }

    //         fclose($file);

    //         return redirect()->back()->with('message', "Importação concluída! {$contadorSucesso} clientes importados.");
    //     } catch (\Exception $e) {
    //         Log::error("Erro na importação na linha {$linhaAtual}: " . $e->getMessage());
    //         return redirect()->back()->with('error', 'Falha na linha ' . $linhaAtual . ': ' . $e->getMessage());
    //     }
    // }

    public function ImportCustomer(Request $request)
    {
        $this->authorizeCustomersAccess();

        ini_set('max_execution_time', 300); // 5 minutos
        ini_set('memory_limit', '512M');

        // 1. Limpa o valor removendo espaços
        $rawCpfCnpj = isset($linha[1]) ? trim($linha[1]) : '';

        // 2. Transforma "sujeira" em NULL real
        $cpfCnpj = in_array($rawCpfCnpj, ['', '0', '---', '--', '*', 'n/a', 'NULL', 'null'])
            ? null
            : $rawCpfCnpj;

        try {
            $request->validate([
                'arquivo' => 'required|mimes:csv,txt|max:2048',
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

            $delimiters = [',', ';', '|'];
            $delimiter = ',';

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

            $ultimoNumero = Customer::where('tenant_id', $tenantId)
                ->max('customer_number') ?? 0;

            $dadosParaInserir = [];

            while (($linha = fgetcsv($file, 1000, $delimiter)) !== false) {

                if (empty($linha[0])) {
                    continue;
                }

                $ultimoNumero++;

                $dadosParaInserir[] = [
                    'tenant_id' => $tenantId,
                    'customer_number' => $ultimoNumero,
                    'name' => mb_convert_encoding($linha[0], 'UTF-8', 'ISO-8859-1, UTF-8'),
                    'cpfcnpj' => $cpfCnpj,
                    'birth' => $linha[2] ?? null,
                    'email' => $linha[3] ?? null,
                    'zipcode' => $linha[4] ?? null,
                    'state' => $linha[5] ?? null,
                    'city' => $linha[6] ?? null,
                    'district' => $linha[7] ?? null,
                    'street' => $linha[8] ?? null,
                    'complement' => $linha[9] ?? null,
                    'number' => $linha[10] ?? null,
                    'phone' => $linha[11] ?? null,
                    'contactname' => $linha[12] ?? null,
                    'whatsapp' => $linha[13] ?? null,
                    'contactphone' => $linha[14] ?? null,
                    'observations' => $linha[15] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                if (count($dadosParaInserir) >= 500) {
                    Customer::insertOrIgnore($dadosParaInserir);
                    $dadosParaInserir = [];
                }
            }

            if (! empty($dadosParaInserir)) {
                Customer::insertOrIgnore($dadosParaInserir);
            }

            fclose($file);

            return redirect()->back()->with('message', 'Importação concluída com sucesso!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Falha na importação: '.$e->getMessage());
        }
    }

    public function getClientes()
    {
        $this->authorizeCustomersAccess();

        $clientes = Customer::get();

        return [
            'success' => true,
            'result' => $clientes,
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorizeCustomersAccess();

        $search = $request->search;
        $pending = $request->get('pending');

        $ordersTotalsSub = Order::query()
            ->selectRaw('customer_id, COALESCE(SUM(service_cost), 0) as total_order_amount')
            ->groupBy('customer_id');

        $paymentsTotalsSub = OrderPayment::query()
            ->join('orders', 'orders.id', '=', 'order_payments.order_id')
            ->selectRaw('orders.customer_id as customer_id, COALESCE(SUM(order_payments.amount), 0) as total_paid_amount')
            ->groupBy('orders.customer_id');

        $query = Customer::query()
            ->leftJoinSub($ordersTotalsSub, 'order_totals', function ($join) {
                $join->on('order_totals.customer_id', '=', 'customers.id');
            })
            ->leftJoinSub($paymentsTotalsSub, 'payment_totals', function ($join) {
                $join->on('payment_totals.customer_id', '=', 'customers.id');
            })
            ->select('customers.*')
            ->selectRaw('COALESCE(order_totals.total_order_amount, 0) as total_order_amount')
            ->selectRaw('COALESCE(payment_totals.total_paid_amount, 0) as total_paid_amount')
            ->selectRaw('(COALESCE(order_totals.total_order_amount, 0) - COALESCE(payment_totals.total_paid_amount, 0)) as pending_amount')
            ->orderBy('customers.id', 'DESC');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('customers.name', 'like', '%'.$search.'%')
                    ->orWhere('customers.cpfcnpj', 'like', '%'.$search.'%');
            });
        }

        if ($pending === '1') {
            $query->whereRaw('(COALESCE(order_totals.total_order_amount, 0) - COALESCE(payment_totals.total_paid_amount, 0)) > 0.009');
        }

        $customers = $query->paginate(11)->withQueryString();
        $customerlast = Customer::orderBy('id', 'DESC')->first();

        return Inertia::render('app/customers/index', [
            'customers' => $customers,
            'customerlast' => $customerlast,
            'search' => $search,
            'pending' => $pending,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorizeCustomersAccess();

        return Inertia::render('app/customers/create-customer');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CustomerRequest $request): RedirectResponse
    {
        $this->authorizeCustomersAccess();

        $data = $request->all();
        $request->validated();
        $data['customer_number'] = Customer::exists() ? Customer::latest()->first()->customer_number + 1 : 1;
        Customer::create($data);

        return redirect()->route('app.customers.index')->with('success', 'Cliente cadastrado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer, Request $request)
    {
        $this->authorizeCustomersAccess();

        return Inertia::render('app/customers/edit-customer', [
            'customer' => $customer,
            'page' => $request->page,
            'search' => $request->search,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer, Request $request)
    {
        $this->authorizeCustomersAccess();

        return Redirect::route('app.customers.show', [
            'customer' => $customer->id,
            'page' => $request->page,
            'search' => $request->search,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CustomerRequest $request, Customer $customer): RedirectResponse
    {
        $this->authorizeCustomersAccess();

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
        $this->authorizeCustomersAccess();

        $customer->delete();

        return redirect()->route('app.customers.index')->with('success', 'Cliente excluido com sucesso!');
    }
}
