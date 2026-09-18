<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerEquipmentRequest;
use App\Models\App\Customer;
use App\Models\App\CustomerEquipment;
use App\Support\TenantSequence;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CustomerEquipmentController extends Controller
{
    /**
     * Store a newly created customer equipment.
     */
    public function store(CustomerEquipmentRequest $request, Customer $customer): RedirectResponse
    {
        Gate::authorize('customer-equipments.access');

        $data = $request->validated();
        $data['customer_id'] = $customer->id;
        $data['status'] = $data['status'] ?? CustomerEquipment::STATUS_ACTIVE;
        $data['customer_equipment_number'] = TenantSequence::next(CustomerEquipment::class, 'customer_equipment_number');

        $customerEquipment = CustomerEquipment::create($data);

        if ($request->boolean('_inline')) {
            return back()->with('customer_equipment_saved', $customerEquipment->only([
                'id', 'customer_equipment_number', 'equipment_id', 'brand', 'model', 'serial_number', 'imei',
            ]));
        }

        return back()->with('success', 'Equipamento cadastrado com sucesso');
    }

    /**
     * Update the specified customer equipment.
     */
    public function update(CustomerEquipmentRequest $request, CustomerEquipment $customerEquipment): RedirectResponse
    {
        Gate::authorize('customer-equipments.access');

        $customerEquipment->update($request->validated());

        return back()->with('success', 'Equipamento atualizado com sucesso');
    }

    /**
     * Remove the specified customer equipment.
     */
    public function destroy(CustomerEquipment $customerEquipment): RedirectResponse
    {
        Gate::authorize('customer-equipments.access');

        if ($customerEquipment->orders()->exists()) {
            return back()->with(
                'error',
                'Não é possível excluir este equipamento porque existem ordens de serviço vinculadas. Desative-o em vez disso.'
            );
        }

        $customerEquipment->delete();

        return back()->with('success', 'Equipamento excluído com sucesso');
    }

    /**
     * Busca leve usada pelo select de equipamento do cliente no formulário de OS.
     * Sempre restrita a um único cliente para não vazar equipamentos de outros clientes do tenant.
     */
    public function search(Request $request)
    {
        Gate::authorize('customer-equipments.access');

        $customerId = $request->integer('customer_id');

        if (! $customerId) {
            return response()->json([]);
        }

        $search = trim((string) $request->get('q', ''));

        $equipments = CustomerEquipment::query()
            ->select(['id', 'customer_equipment_number', 'equipment_id', 'brand', 'model', 'serial_number', 'imei'])
            ->where('customer_id', $customerId)
            ->where('status', CustomerEquipment::STATUS_ACTIVE)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('brand', 'like', '%'.$search.'%')
                        ->orWhere('model', 'like', '%'.$search.'%')
                        ->orWhere('serial_number', 'like', '%'.$search.'%')
                        ->orWhere('imei', 'like', '%'.$search.'%');
                });
            })
            ->orderByDesc('id')
            ->limit(20)
            ->get();

        return response()->json($equipments);
    }
}
