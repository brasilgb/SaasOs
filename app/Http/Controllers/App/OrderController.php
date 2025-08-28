<?php

namespace App\Http\Controllers\App;

use App\Http\Requests\OrderRequest;
use App\Http\Controllers\Controller;
use App\Models\App\Customer;
use App\Models\App\Equipment;
use App\Models\App\Order;
use App\Models\User;
use App\Models\App\WhatsappMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
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
        $technicals = User::where('roles', 3)->orWhere('roles', 1)->where('is_active', 1)->get();
        return Inertia::render('app/orders/edit-order', ['order' => $order, 'customers' => $customers, 'technicals' => $technicals, 'equipments' => $equipments]);
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
        // $data['delivery_date'] = $data['service_status'] === 8 ? date(now()) : '';
        $order->update($data);
        return redirect()->route('app.orders.show', ['order' => $order->id])->with('success', 'Ordem atualizada com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $order->delete();
        return redirect()->route('app.orders.index')->with('success', 'Ordem excluída com sucesso');
    }
}
