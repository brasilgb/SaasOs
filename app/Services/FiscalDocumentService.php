<?php

namespace App\Services;

use App\Models\App\FiscalDocument;
use App\Models\App\FiscalSetting;
use App\Models\App\Order;
use App\Models\App\Sale;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class FiscalDocumentService
{
    public function __construct(private readonly FocusNfeService $focusNfeService) {}

    public function registerManualOrder(Order $order, array $data, int $userId): FiscalDocument
    {
        $this->ensureManualRegistrationAllowed('nfse_enabled', 'NFS-e');

        $documentKey = $order->fiscal_document_key ?: $this->manualKey($order->tenant_id, $order->id, $data['fiscal_document_number']);
        $issuedAt = $this->issuedAt($data['fiscal_issued_at'] ?? null);

        $order->update([
            'fiscal_document_number' => $data['fiscal_document_number'],
            'fiscal_document_key' => $documentKey,
            'fiscal_document_url' => $data['fiscal_document_url'] ?? null,
            'fiscal_issued_at' => $issuedAt,
            'fiscal_registered_by' => $userId,
            'fiscal_notes' => $data['fiscal_notes'] ?? null,
        ]);

        return FiscalDocument::updateOrCreate(
            [
                'documentable_type' => Order::class,
                'documentable_id' => $order->id,
                'provider' => 'manual',
            ],
            [
                'tenant_id' => $order->tenant_id,
                'type' => 'nfse',
                'number' => $data['fiscal_document_number'],
                'access_key' => $documentKey,
                'status' => 'registered',
                'pdf_url' => $data['fiscal_document_url'] ?? null,
                'issued_at' => $issuedAt,
                'registered_by' => $userId,
                'notes' => $data['fiscal_notes'] ?? null,
            ]
        );
    }

    public function registerManualSale(Sale $sale, array $data, int $userId): FiscalDocument
    {
        $this->ensureManualRegistrationAllowed('nfe_enabled', 'NF-e');

        if ($sale->status === 'cancelled') {
            throw new \RuntimeException('Não é possível registrar comprovante fiscal em venda cancelada.');
        }

        $documentKey = $sale->fiscal_document_key ?: $this->manualKey($sale->tenant_id, $sale->id, $data['fiscal_document_number']);
        $issuedAt = $this->issuedAt($data['fiscal_issued_at'] ?? null);

        $sale->update([
            'fiscal_document_number' => $data['fiscal_document_number'],
            'fiscal_document_key' => $documentKey,
            'fiscal_document_url' => $data['fiscal_document_url'] ?? null,
            'fiscal_issued_at' => $issuedAt,
            'fiscal_registered_by' => $userId,
            'fiscal_notes' => $data['fiscal_notes'] ?? null,
        ]);

        return FiscalDocument::updateOrCreate(
            [
                'documentable_type' => Sale::class,
                'documentable_id' => $sale->id,
                'provider' => 'manual',
            ],
            [
                'tenant_id' => $sale->tenant_id,
                'type' => 'nfe',
                'number' => $data['fiscal_document_number'],
                'access_key' => $documentKey,
                'status' => 'registered',
                'pdf_url' => $data['fiscal_document_url'] ?? null,
                'issued_at' => $issuedAt,
                'registered_by' => $userId,
                'notes' => $data['fiscal_notes'] ?? null,
            ]
        );
    }

    public function issueOrderNfse(Order $order): FiscalDocument
    {
        return $this->focusNfeService->issueOrderNfse($order);
    }

    public function issueSaleNfe(Sale $sale): FiscalDocument
    {
        return $this->focusNfeService->issueSaleNfe($sale);
    }

    public function sync(FiscalDocument $document): FiscalDocument
    {
        return $this->focusNfeService->refreshDocument($document);
    }

    private function manualKey(int|string|null $tenantId, int|string $documentableId, string $number): string
    {
        return hash('sha256', implode('|', [
            (string) $tenantId,
            (string) $documentableId,
            $number,
            (string) Str::uuid(),
        ]));
    }

    private function issuedAt(mixed $value): Carbon
    {
        return blank($value) ? now() : Carbon::parse($value);
    }

    private function ensureManualRegistrationAllowed(string $feature, string $documentLabel): void
    {
        $automaticEnabled = FiscalSetting::query()
            ->where('enabled', true)
            ->where($feature, true)
            ->whereNotNull('api_token')
            ->exists();

        if ($automaticEnabled) {
            throw new \RuntimeException("O registro manual de {$documentLabel} está desativado porque a emissão automática pela Focus NFe está habilitada.");
        }
    }
}
