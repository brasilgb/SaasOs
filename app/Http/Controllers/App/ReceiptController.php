<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Checklist;
use App\Models\App\Company;
use App\Models\App\Equipment;
use App\Models\App\Order;
use App\Models\App\Receipt;
use App\Support\Pagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ReceiptController extends Controller
{
    private function defaultReceiptMessages(): array
    {
        return [
            'receivingequipment' => 'Eu {{ cliente }}, inscrito(a) sob CPF/CNPJ numero {{ cpf_cnpj }}, me responsabilizo por eventuais perdas e/ou danos de arquivos, fotos, agenda, ou quaisquer outros dados armazenados no HD, SSD, cartao de memoria ou memoria interna do meu equipamento, inclusive peliculas ou adesivos, capas e demais acessorios, ficando a Mega System Informatica isenta de qualquer responsabilidade. E obrigatoria a apresentacao desta Ordem de Servico (O.S.) no ato da retirada para que o equipamento seja liberado pela empresa. Caso o aparelho nao seja retirado em ate 90 dias, a contar da presente data, tal fato sera considerado como abandono, estando a empresa apta a descarta-lo. O(A) cliente declara e reconhece que todas as informacoes aqui fornecidas sao verdadeiras e que entendeu e aceitou todos os termos desta Ordem de Servico.',
            'equipmentdelivery' => 'Eu {{ cliente }}, inscrito(a) sob CPF/CNPJ numero {{ cpf_cnpj }}, declaro estar ciente de que, de acordo com o Codigo de Defesa do Consumidor (Lei n. 8.078/90, secao IV, Art. 26), tenho o direito de solicitar a garantia pelo servico executado em 30 (trinta) dias, tratando-se de servicos e de produtos nao duraveis (relacionado a sistema); e em 90 (noventa) dias, tratando-se de fornecimento de servico e de produtos duraveis (relacionado a pecas).',
            'budgetissuance' => 'Equipamento analisado preliminarmente. Segue orcamento inicial para reparo conforme diagnostico tecnico apresentado nesta O.S. O servico sera executado somente mediante aprovacao do cliente. Valores e prazo podem sofrer alteracoes caso sejam identificadas necessidades adicionais durante o reparo.',
        ];
    }

    private function currentTenantId(): ?int
    {
        return Auth::user()?->tenant_id ? (int) Auth::user()->tenant_id : null;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('receipts.access');

        $receipt = Receipt::query()->latest('id')->first() ?? Receipt::create($this->defaultReceiptMessages());
        $search = $request->search;
        $checklistsQuery = Checklist::with('equipment')->orderBy('id', 'DESC');

        if ($search) {
            $checklistsQuery->where(function ($query) use ($search) {
                $query->where('checklist', 'like', "%{$search}%")
                    ->orWhereHas('equipment', function ($equipmentQuery) use ($search) {
                        $equipmentQuery->where('equipment', 'like', "%{$search}%");
                    });
            });
        }

        $checklists = $checklistsQuery->paginate(Pagination::perPage())->withQueryString();
        $equipments = Equipment::get();

        $activeTab = in_array($request->query('tab'), ['receipts', 'checklists'], true)
            ? $request->query('tab')
            : 'receipts';

        return Inertia::render('app/receipts/index', [
            'receipt' => $receipt,
            'defaultReceiptMessages' => $this->defaultReceiptMessages(),
            'checklists' => $checklists,
            'equipments' => $equipments,
            'activeTab' => $activeTab,
        ]);
    }

    public function update(Request $request, Receipt $receipt): RedirectResponse
    {
        Gate::authorize('receipts.access');

        $data = $request->validate([
            'receivingequipment' => ['nullable', 'string', 'max:3000'],
            'equipmentdelivery' => ['nullable', 'string', 'max:3000'],
            'budgetissuance' => ['nullable', 'string', 'max:3000'],
        ]);

        $receipt->update($data);

        return redirect()->route('app.receipts.index', ['receipts' => $receipt->id])->with('success', 'Recibos editados com sucesso');
    }

    public function printing($or, $tp)
    {
        Gate::authorize('receipts.access');

        $order = Order::where('id', $or)->with(['customer', 'equipment', 'orderParts'])->firstOrFail();
        $this->authorize('view', $order);
        $company = Company::query()
            ->where('tenant_id', $this->currentTenantId())
            ->first();
        $receipt = Receipt::first();
        $checklist = Checklist::where('equipment_id', $order->equipment_id)->first('checklist');

        return Inertia::render('app/receipts/print-receipt', ['order' => $order, 'type' => $tp, 'company' => $company, 'receipt' => $receipt, 'checklist' => $checklist]);
    }
}
