<?php

namespace App\Http\Controllers\App;

use App\Http\Requests\OrderRequest;
use App\Http\Controllers\Controller;
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Order;
use App\Models\App\Part;
use App\Models\User;
use App\Services\InventoryService;
use App\Models\App\WhatsappMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{

    // Display and linting order for id
    public function allOrder()
    {
        $dashData = [
            'numorder' => count(Order::get()),
            'numabertas' => count(Order::where('service_status', 1)->get()), // aberta
            'numgerados' => count(Order::where('service_status', 3)->get()), // orc. gerado
            'numaprovados' => count(Order::where('service_status', 4)->get()), // orc. aprovado
            'numconcluidosca' => count(Order::where('service_status', 6)->get()), // concluido cli nao avisado
            'numconcluidoscn' => count(Order::where('service_status', 7)->get()), // concluido cli avisado
        ];
        return [
            'success' => true,
            'result' => $dashData
        ];
    }

    // Display and linting order for id
    public function getOrder($order)
    {
        $query = Order::where('id', $order)->with('customer')->with('equipment')->get();
        return [
            'success' => true,
            'result' => $query
        ];
    }

    // Display and listing customers for id order
    public function getOrderCli($customer)
    {
        $query = Order::where('customer_id', $customer)->with('customer')->with('equipment')->get();
        return [
            'success' => true,
            'result' => $query
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $status = $request->get('status');
        $search = $request->get('q');
        $customer = $request->get('oc');

        $endDate = Carbon::now()->subDays(25)->endOfDay();
        $startDate = Carbon::now()->subDays(30)->startOfDay();
        $allfeedback = Order::where('service_status', 8)
            ->whereBetween('delivery_date', [$startDate, $endDate])
            ->get('id');

        $query = Order::orderBy('id', 'DESC');
        if ($status) {
            if ($status > 10) {
                $query->where('service_status', 8)
                    ->whereBetween('delivery_date', [$startDate, $endDate])
                    ->get('id');
            } else {
                $query->where('service_status', $status);
            }
        }
        if ($customer) {
            $query->where('customer_id', $customer);
        }
        if ($search) {
            $query = Order::where(function ($query) use ($search) {
                $query->where('id', 'like', '%' . $search . '%');
            })
                ->orWhereHas('customer', function ($query) use ($search) {
                    $query->where('name', 'like', "%$search%")
                        ->orWhere('cpf', 'like', '%' . $search . '%');
                });
        }
        $orders = $query->with('equipment')->with('customer')->paginate(11);
        $whats = WhatsappMessage::first();
        $trintadias = $allfeedback;

        return Inertia::render('app/orders/index', [
            'orders' => $orders,
            'whats' => $whats,
            'trintadias' => $trintadias
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $equipments = Equipment::get();
        $customers = Customer::get();
        return Inertia::render('app/orders/create-order', ['customers' => $customers, 'equipments' => $equipments]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(OrderRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $data['order_number'] = Order::exists() ? Order::latest()->first()->order_number + 1 : 1;
        Order::create($data);
        return redirect()->route('app.orders.index')->with('success',  'Ordem cadastrada com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $equipments = Equipment::get();
        $customers = Customer::get();
        $parts = Part::get();
        $technicals = User::where('roles', 3)->orWhere('roles', 1)->where('is_active', 1)->get();
        $orderparts = $order->parts()->pivot()->get();

        return Inertia::render('app/orders/edit-order', ['order' => $order, 'orderparts' => $orderparts, 'customers' => $customers, 'technicals' => $technicals, 'equipments' => $equipments, 'parts' => $parts]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        return redirect()->route('app.orders.show', ['order' => $order->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(OrderRequest $request, Order $order): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $order->update([
            "customer_id" => $data['customer_id'],
            "equipment_id" => $data['equipment_id'], // equipamento
            "model" => $data['model'],
            "password" => $data['password'],
            "defect" => $data['defect'],
            "state_conservation" => $data['state_conservation'], //estado de conservação
            "accessories" => $data['accessories'],
            "budget_description" => $data['budget_description'], // descrição do orçamento
            "budget_value" => $data['budget_value'], // valor do orçamento
            "services_performed" => $data['services_performed'], // servicos executados
            "parts" => $data['parts'],
            "parts_value" => $data['parts_value'],
            "service_value" => $data['service_value'],
            "service_cost" => $data['service_cost'], // custo
            "delivery_date" => $data['delivery_date'], // $data de entrega
            "responsible_technician" => $data['responsible_technician'],
            "service_status" => $data['service_status'],
            "delivery_forecast" => $data['delivery_forecast'], // previsao de entrega
            "observations" => $data['observations'],
        ]);

        if (isset($data['allparts'])) {
            $partsToAttach = [];
            foreach ($data['allparts'] as $part) {
                $partsToAttach[$part['id']] = ['quantity' => $part['quantity']];
            }
            // 2. Vincula as peças à Ordem de Serviço usando a tabela pivô
            $order->parts()->attach($partsToAttach);
        }

        return redirect()->route('app.orders.show', ['order' => $order->id])->with('success', 'Ordem atualizada com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $order->delete();
        $order->parts()->detach();
        return redirect()->route('app.orders.index')->with('success', 'Ordem excluída com sucesso');
    }

    public function removePart(Request $request)
    {
        $validatedData = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'part_id' => 'required|integer|exists:parts,id',
        ]);

        $order = Order::find($validatedData['order_id']);

        // Encontra o registro na tabela pivô para obter a quantidade
        $pivotRecord = $order->parts()->where('part_id', $validatedData['part_id'])->first();

        if (!$pivotRecord) {
            return back()->with('error', 'Esta peça não está vinculada a esta ordem de serviço.');
        }

        $partId = $pivotRecord->id; // ID da peça

        // 1. Desvincula a peça da Ordem de Serviço na tabela pivô
        $order->parts()->detach($partId);

        return redirect()->route('app.orders.show', $order)->with('success', 'Peça removida e estoque devolvido com sucesso.');
    }
}