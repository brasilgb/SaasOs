<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerRequest;
use App\Models\App\Customer;
use App\Models\App\Order;
use App\Models\App\OrderPayment;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class CustomerController extends Controller
{
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

    private function normalizeCsvValue(array $row, int $index): ?string
    {
        if (! array_key_exists($index, $row)) {
            return null;
        }

        $value = trim((string) $row[$index]);
        $value = preg_replace('/^\xEF\xBB\xBF/', '', $value ?? '');

        if ($value === '') {
            return null;
        }

        return mb_convert_encoding($value, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252');
    }

    private function normalizeCsvDate(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $value = trim($value);

        foreach (['d/m/Y', 'Y-m-d', 'd-m-Y'] as $format) {
            try {
                return Carbon::createFromFormat($format, $value)->format('Y-m-d');
            } catch (\Throwable $e) {
                // tenta o próximo formato
            }
        }

        return null;
    }

    private function normalizeSpreadsheetNumber(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $value = trim($value);

        if (preg_match('/^-?\d+(?:[.,]\d+)?E[+-]?\d+$/i', $value) === 1) {
            $normalized = str_replace(',', '.', $value);

            if (is_numeric($normalized)) {
                return number_format((float) $normalized, 0, '', '');
            }
        }

        return $value;
    }

    public function ImportCustomer(Request $request)
    {
        Gate::authorize('customers.access');

        ini_set('max_execution_time', 300); // 5 minutos
        ini_set('memory_limit', '512M');

        try {
            $request->validate([
                'arquivo' => 'required|mimes:csv,txt|max:4096',
            ], [
                'arquivo.required' => 'Por favor, selecione um arquivo.',
                'arquivo.mimes' => 'O arquivo deve ser do tipo CSV ou TXT.',
            ]);

            $tenantId = Auth::user()->tenant_id;
            $path = $request->file('arquivo')->getRealPath();
            $file = fopen($path, 'r');

            if ($file === false) {
                throw new \RuntimeException('Não foi possível abrir o arquivo enviado.');
            }

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
            fgetcsv($file, 0, $delimiter);

            $ultimoNumero = Customer::where('tenant_id', $tenantId)->max('customer_number') ?? 0;
            $existingCpfCnpjs = Customer::where('tenant_id', $tenantId)
                ->whereNotNull('cpfcnpj')
                ->pluck('cpfcnpj')
                ->map(fn ($value) => preg_replace('/\D+/', '', (string) $value))
                ->filter()
                ->flip()
                ->all();

            $dadosParaInserir = [];
            $inserted = 0;
            $skippedEmpty = 0;
            $normalizedCpfAsNull = 0;
            $lineNumber = 1;

            while (($linha = fgetcsv($file, 0, $delimiter)) !== false) {
                $lineNumber++;

                $name = $this->normalizeCsvValue($linha, 0);
                if ($name === null) {
                    $skippedEmpty++;
                    continue;
                }

                $rawCpfCnpj = $this->normalizeCsvValue($linha, 1) ?? '';
                $cpfCnpj = in_array($rawCpfCnpj, ['', '0', '---', '--', '*', 'n/a', 'NULL', 'null'], true)
                    ? null
                    : preg_replace('/\D+/', '', $rawCpfCnpj);

                if ($cpfCnpj && ! in_array(strlen($cpfCnpj), [11, 14], true)) {
                    $cpfCnpj = null;
                    $normalizedCpfAsNull++;
                }

                if ($cpfCnpj && isset($existingCpfCnpjs[$cpfCnpj])) {
                    $cpfCnpj = null;
                    $normalizedCpfAsNull++;
                }

                $ultimoNumero++;

                $phone = $this->normalizeSpreadsheetNumber($this->normalizeCsvValue($linha, 11));
                $whatsapp = $this->normalizeSpreadsheetNumber($this->normalizeCsvValue($linha, 13));
                $contactPhone = $this->normalizeSpreadsheetNumber($this->normalizeCsvValue($linha, 14));

                $dadosParaInserir[] = [
                    'tenant_id' => $tenantId,
                    'customer_number' => $ultimoNumero,
                    'name' => $name,
                    'cpfcnpj' => $cpfCnpj,
                    'birth' => $this->normalizeCsvDate($this->normalizeCsvValue($linha, 2)),
                    'email' => $this->normalizeCsvValue($linha, 3),
                    'zipcode' => $this->normalizeCsvValue($linha, 4),
                    'state' => $this->normalizeCsvValue($linha, 5),
                    'city' => $this->normalizeCsvValue($linha, 6),
                    'district' => $this->normalizeCsvValue($linha, 7),
                    'street' => $this->normalizeCsvValue($linha, 8),
                    'complement' => $this->normalizeCsvValue($linha, 9),
                    'number' => is_numeric((string) $this->normalizeCsvValue($linha, 10)) ? (int) $this->normalizeCsvValue($linha, 10) : null,
                    'phone' => $phone,
                    'contactname' => $this->normalizeCsvValue($linha, 12),
                    'whatsapp' => $whatsapp,
                    'contactphone' => $contactPhone,
                    'observations' => $this->normalizeCsvValue($linha, 15),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                if ($cpfCnpj) {
                    $existingCpfCnpjs[$cpfCnpj] = true;
                }

                if (count($dadosParaInserir) >= 500) {
                    Customer::insert($dadosParaInserir);
                    $inserted += count($dadosParaInserir);
                    $dadosParaInserir = [];
                }
            }

            if (! empty($dadosParaInserir)) {
                Customer::insert($dadosParaInserir);
                $inserted += count($dadosParaInserir);
            }

            fclose($file);

            $message = "Importação concluída: {$inserted} clientes salvos.";
            if ($normalizedCpfAsNull > 0 || $skippedEmpty > 0) {
                $message .= ' Ajustados:';
                if ($normalizedCpfAsNull > 0) {
                    $message .= " {$normalizedCpfAsNull} CPF/CNPJ inválidos ou repetidos salvos sem documento";
                }
                if ($skippedEmpty > 0) {
                    $message .= ($normalizedCpfAsNull > 0 ? ' e' : '')." {$skippedEmpty} linhas sem nome ignoradas";
                }
                $message .= '.';
            }

            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Falha na importação: '.$e->getMessage());
        }
    }

    public function getClientes()
    {
        Gate::authorize('customers.access');

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
        Gate::authorize('customers.access');

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
        Gate::authorize('customers.access');

        return Inertia::render('app/customers/create-customer');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CustomerRequest $request): RedirectResponse
    {
        Gate::authorize('customers.access');

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
        Gate::authorize('customers.access');

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
        Gate::authorize('customers.access');

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
        Gate::authorize('customers.access');

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
        Gate::authorize('customers.access');

        if ($customer->orders()->exists() || $customer->sales()->exists() || $customer->schedules()->exists()) {
            return redirect()->route('app.customers.index')->with(
                'error',
                'Não é possível excluir este cliente porque existem ordens, vendas ou agendamentos vinculados.'
            );
        }

        $customer->delete();

        return redirect()->route('app.customers.index')->with('success', 'Cliente excluido com sucesso!');
    }
}
