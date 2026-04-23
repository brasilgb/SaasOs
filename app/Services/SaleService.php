<?php

namespace App\Services;

use App\Models\App\CashSession;
use App\Models\App\FiscalDocument;
use App\Models\App\Part;
use App\Models\App\Sale;
use App\Models\App\SaleItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class SaleService
{
    public function create(array $data): Sale
    {
        return DB::transaction(function () use ($data) {
            $openCashSession = CashSession::query()
                ->where('status', 'open')
                ->latest('opened_at')
                ->first();

            if (! $openCashSession) {
                throw new RuntimeException('Abra o caixa diário antes de concluir uma venda.');
            }

            $totalAmount = round((float) $data['total_amount'], 2);
            $paidAmount = round((float) ($data['paid_amount'] ?? $data['total_amount']), 2);

            if ($paidAmount > $totalAmount) {
                throw new RuntimeException('O valor pago não pode ser maior que o total da venda.');
            }

            $sale = Sale::create([
                'sales_number' => Sale::max('sales_number') + 1,
                'customer_id' => $data['customer_id'] ?? null,
                'cash_session_id' => $openCashSession->id,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'financial_status' => $this->resolveFinancialStatus($totalAmount, $paidAmount, 'completed'),
                'payment_method' => $data['payment_method'],
                'status' => 'completed',
            ]);

            foreach ($data['parts'] as $item) {
                $part = Part::lockForUpdate()->findOrFail($item['part_id']);

                if ($part->quantity < $item['quantity']) {
                    throw new RuntimeException("Estoque insuficiente para {$part->name}");
                }

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'part_id' => $part->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $part->sale_price,
                ]);

                $part->decrement('quantity', $item['quantity']);
            }

            return $sale;
        });
    }

    public function cancel(Sale $sale, string $reason, ?User $user): Sale
    {
        if ($sale->status === 'cancelled') {
            throw new RuntimeException('Venda já está cancelada.');
        }

        if ($sale->cashSession && $sale->cashSession->status === 'closed') {
            throw new RuntimeException('Não é possível cancelar venda vinculada a caixa já fechado.');
        }

        if ($user?->roles === User::ROLE_OPERATOR && $sale->created_at->diffInMinutes(now()) > 60) {
            throw new RuntimeException('Operador só pode cancelar vendas com até 60 minutos. Solicite um administrador.');
        }

        return DB::transaction(function () use ($sale, $reason, $user) {
            foreach ($sale->items as $item) {
                $part = Part::find($item->part_id);

                if ($part) {
                    $part->quantity += $item->quantity;
                    $part->save();
                }
            }

            $sale->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancelled_by' => $user?->id,
                'cancel_reason' => $reason,
                'financial_status' => 'cancelled',
            ]);

            return $sale->fresh();
        });
    }

    public function delete(Sale $sale, ?User $user): void
    {
        if ($sale->status !== 'cancelled') {
            throw new RuntimeException('Somente vendas canceladas podem ser excluídas.');
        }

        if (! $user?->isRoot() && ! $user?->isAdministrator()) {
            throw new RuntimeException('Apenas administradores podem excluir vendas.');
        }

        if ($sale->cashSession && $sale->cashSession->status === 'closed') {
            throw new RuntimeException('Não é possível excluir venda de caixa já fechado.');
        }

        DB::transaction(function () use ($sale) {
            $sale->delete();
        });
    }

    public function registerFiscal(Sale $sale, array $data, int $userId): Sale
    {
        if ($sale->status === 'cancelled') {
            throw new RuntimeException('Não é possível registrar comprovante fiscal em venda cancelada.');
        }

        $fiscalDocumentKey = $sale->fiscal_document_key;

        if (empty($fiscalDocumentKey)) {
            $fiscalDocumentKey = hash('sha256', implode('|', [
                (string) $sale->tenant_id,
                (string) $sale->id,
                (string) $data['fiscal_document_number'],
                (string) Str::uuid(),
            ]));
        }

        $sale->update([
            'fiscal_document_number' => $data['fiscal_document_number'],
            'fiscal_document_key' => $fiscalDocumentKey,
            'fiscal_document_url' => $data['fiscal_document_url'] ?? null,
            'fiscal_issued_at' => $data['fiscal_issued_at'] ?? now(),
            'fiscal_registered_by' => $userId,
            'fiscal_notes' => $data['fiscal_notes'] ?? null,
        ]);

        FiscalDocument::updateOrCreate(
            [
                'documentable_type' => Sale::class,
                'documentable_id' => $sale->id,
                'provider' => 'manual',
            ],
            [
                'tenant_id' => $sale->tenant_id,
                'type' => 'nfe',
                'number' => $data['fiscal_document_number'],
                'access_key' => $fiscalDocumentKey,
                'status' => 'registered',
                'pdf_url' => $data['fiscal_document_url'] ?? null,
                'issued_at' => $data['fiscal_issued_at'] ?? now(),
                'registered_by' => $userId,
                'notes' => $data['fiscal_notes'] ?? null,
            ]
        );

        return $sale->fresh();
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
}
