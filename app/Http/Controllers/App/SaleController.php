<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\CashSession;
use App\Models\App\Part;
use App\Models\App\Sale;
use App\Models\App\SaleLog;
use App\Models\App\SaleItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SaleController extends Controller
{
    private function logSaleAction(Sale $sale, string $action, array $data = []): void
    {
        SaleLog::create([
            'sale_id' => $sale->id,
            'user_id' => Auth::id(),
            'action' => $action,
            'data' => $data,
        ]);
    }

    private function resolveFinancialStatus(float $totalAmount, float $paidAmount, string $saleStatus): string
    {
        if ($saleStatus === 'cancelled') {
            return 'cancelled';
        }

        if ($paidAmount <= 0) {
            return 'pending';
        }

        if ($paidAmount < $totalAmount) {
            return 'partial';
        }

        return 'paid';
    }

    private function authorizeSalesAccess(): void
    {
        abort_unless(Auth::user()?->hasPermission('sales'), 403);
    }

    public function index(Request $request)
    {
        $this->authorizeSalesAccess();

        $search = $request->search;
        $financialStatus = $request->get('financial_status');
        $baseQuery = Sale::query();

        if ($search) {
            $baseQuery->where(function ($q) use ($search) {
                $q->where('sales_number', 'like', '%'.$search.'%')
                    ->orWhereHas('customer', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', '%'.$search.'%');
                    });
            });
        }

        $counts = [
            'paid' => (clone $baseQuery)->where('financial_status', 'paid')->count(),
            'partial' => (clone $baseQuery)->where('financial_status', 'partial')->count(),
            'pending' => (clone $baseQuery)->where('financial_status', 'pending')->count(),
            'cancelled' => (clone $baseQuery)->where('financial_status', 'cancelled')->count(),
        ];

        $query = (clone $baseQuery)
            ->with('customer')
            ->with('items.part')
            ->with('cancelledBy:id,name')
            ->with('fiscalRegisteredBy:id,name')
            ->with('logs.user:id,name')
            ->orderBy('id', 'DESC');

        if ($financialStatus) {
            $query->where('financial_status', $financialStatus);
        }
        $sales = $query->paginate(11)->withQueryString();

        return Inertia::render('app/sales/index', [
            'sales' => $sales,
            'search' => $search,
            'financial_status' => $financialStatus,
            'financial_counts' => $counts,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeSalesAccess();

        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'total_amount' => 'required|numeric',
            'paid_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:pix,cartao,dinheiro,transferencia,boleto',
            'parts' => 'required|array',
            'parts.*.part_id' => 'required|exists:parts,id',
            'parts.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $openCashSession = CashSession::query()
                ->where('status', 'open')
                ->latest('opened_at')
                ->first();

            if (! $openCashSession) {
                throw new \Exception('Abra o caixa diário antes de concluir uma venda.');
            }

            $totalAmount = round((float) $request->total_amount, 2);
            $paidAmount = round((float) ($request->paid_amount ?? $request->total_amount), 2);

            if ($paidAmount > $totalAmount) {
                throw new \Exception('O valor pago não pode ser maior que o total da venda.');
            }

            $financialStatus = $this->resolveFinancialStatus($totalAmount, $paidAmount, 'completed');

            $sale = Sale::create([
                'sales_number' => Sale::max('sales_number') + 1,
                'customer_id' => $request->customer_id,
                'cash_session_id' => $openCashSession->id,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'financial_status' => $financialStatus,
                'payment_method' => $request->payment_method,
                'status' => 'completed',
            ]);

            foreach ($request->parts as $item) {
                $part = Part::lockForUpdate()->findOrFail($item['part_id']);

                if ($part->quantity < $item['quantity']) {
                    throw new \Exception("Estoque insuficiente para {$part->name}");
                }

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'part_id' => $part->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $part->sale_price,
                ]);

                $part->decrement('quantity', $item['quantity']);
            }

            $this->logSaleAction($sale, 'created', [
                'payment_method' => $sale->payment_method,
                'total_amount' => (float) $sale->total_amount,
                'paid_amount' => (float) $sale->paid_amount,
                'financial_status' => $sale->financial_status,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'sale' => [
                    'id' => $sale->id,
                    'date' => $sale->created_at,
                    'payment_method' => $sale->payment_method,
                    'paid_amount' => $sale->paid_amount,
                    'financial_status' => $sale->financial_status,
                ],
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function cancel(Sale $sale)
    {
        $this->authorizeSalesAccess();
        $user = Auth::user();

        $validated = request()->validate([
            'cancel_reason' => 'required|string|min:8|max:500',
        ]);

        if ($sale->status === 'cancelled') {
            return back()->with('error', 'Venda já está cancelada.');
        }

        if ($sale->cashSession && $sale->cashSession->status === 'closed') {
            return back()->with('error', 'Não é possível cancelar venda vinculada a caixa já fechado.');
        }

        if ($user?->roles === User::ROLE_OPERATOR && $sale->created_at->diffInMinutes(now()) > 60) {
            return back()->with('error', 'Operador só pode cancelar vendas com até 60 minutos. Solicite um administrador.');
        }

        DB::transaction(function () use ($sale, $validated) {

            foreach ($sale->items as $item) {
                $part = Part::find($item->part_id);
                $part->quantity += $item->quantity;
                $part->save();
            }

            $sale->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancelled_by' => Auth::id(),
                'cancel_reason' => $validated['cancel_reason'],
                'financial_status' => 'cancelled',
            ]);

            $this->logSaleAction($sale, 'cancelled', [
                'reason' => $validated['cancel_reason'],
            ]);
        });

        return back()->with('success', 'Venda cancelada com sucesso.');
    }

    public function destroy(Sale $sale)
    {
        $this->authorizeSalesAccess();
        $user = Auth::user();

        if (! $user?->isRoot() && ! $user?->isAdministrator()) {
            return back()->with('error', 'Apenas administradores podem excluir vendas.');
        }

        if ($sale->status !== 'cancelled') {
            return back()->with('error', 'Somente vendas canceladas podem ser excluídas.');
        }

        if ($sale->cashSession && $sale->cashSession->status === 'closed') {
            return back()->with('error', 'Não é possível excluir venda de caixa já fechado.');
        }

        try {
            DB::beginTransaction();

            // Itera sobre os itens da venda para retornar as peças ao estoque
            foreach ($sale->items as $item) {
                $part = Part::find($item->part_id);
                if ($part) {
                    // Incrementa a quantidade da peça de volta ao estoque
                    $part->increment('quantity', $item->quantity);
                }
            }

            // Exclui a venda (os itens da venda serão excluídos em cascata se configurado no banco de dados)
            $sale->delete();

            DB::commit();

            return redirect()->route('app.sales.index')->with('success', 'Venda excluída e estoque estornado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Erro ao excluir a venda: '.$e->getMessage());
        }
    }

    public function registerFiscal(Request $request, Sale $sale)
    {
        $this->authorizeSalesAccess();

        if ($sale->status === 'cancelled') {
            return back()->with('error', 'Não é possível registrar comprovante fiscal em venda cancelada.');
        }

        $validated = $request->validate([
            'fiscal_document_number' => 'required|string|max:120',
            'fiscal_document_url' => 'nullable|url|max:500',
            'fiscal_issued_at' => 'nullable|date',
            'fiscal_notes' => 'nullable|string|max:2000',
        ]);

        $fiscalDocumentKey = $sale->fiscal_document_key;

        if (empty($fiscalDocumentKey)) {
            $fiscalDocumentKey = hash('sha256', implode('|', [
                (string) $sale->tenant_id,
                (string) $sale->id,
                (string) $validated['fiscal_document_number'],
                (string) Str::uuid(),
            ]));
        }

        $sale->update([
            'fiscal_document_number' => $validated['fiscal_document_number'],
            'fiscal_document_key' => $fiscalDocumentKey,
            'fiscal_document_url' => $validated['fiscal_document_url'] ?? null,
            'fiscal_issued_at' => $validated['fiscal_issued_at'] ?? now(),
            'fiscal_registered_by' => Auth::id(),
            'fiscal_notes' => $validated['fiscal_notes'] ?? null,
        ]);

        $this->logSaleAction($sale, 'fiscal_registered', [
            'fiscal_document_number' => $sale->fiscal_document_number,
            'fiscal_document_key' => $sale->fiscal_document_key,
        ]);

        return back()->with('success', 'Comprovante fiscal registrado com sucesso.');
    }
}
