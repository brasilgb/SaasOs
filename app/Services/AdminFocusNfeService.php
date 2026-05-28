<?php

namespace App\Services;

use App\Models\Admin\AdminFiscalDocument;
use App\Models\Admin\AdminFiscalSetting;
use App\Models\App\Payment;
use App\Models\Tenant;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class AdminFocusNfeService
{
    private const BASE_URL = 'https://api.focusnfe.com.br/v2';

    public function issueTenantSubscriptionNfse(Tenant $tenant, ?float $amount = null, ?string $description = null, ?Payment $payment = null): AdminFiscalDocument
    {
        $setting = $this->activeSetting();
        $amount = $amount ?? (float) ($tenant->plan?->value ?? 0);

        if ($amount <= 0) {
            throw new RuntimeException('Informe um valor maior que zero para emitir a NFS-e da assinatura.');
        }

        $description = $this->serviceDescription($setting, $tenant, $description);
        if ($payment?->admin_fiscal_document_id) {
            $existing = AdminFiscalDocument::query()->find($payment->admin_fiscal_document_id);
            if ($existing) {
                return $existing;
            }
        }

        $document = $this->createProcessingDocument($tenant, $setting, $amount, $description, $payment);
        $payload = $this->buildNfsePayload($tenant, $setting, $amount, $description);

        return $this->sendAndUpdate($document, 'nfse', $document->provider_reference, $payload, $setting);
    }

    public function refreshDocument(AdminFiscalDocument $document): AdminFiscalDocument
    {
        if ($document->provider !== 'focus_nfe' || blank($document->provider_reference)) {
            throw new RuntimeException('Documento fiscal sem referência válida da Focus NFe.');
        }

        $setting = $this->activeSetting();
        $response = $this->get('nfse', $document->provider_reference, $setting);

        return $this->updateFromFocusResponse($document, $response);
    }

    private function activeSetting(): AdminFiscalSetting
    {
        $setting = AdminFiscalSetting::query()->first();

        if (! $setting || ! $setting->enabled || empty($setting->api_token)) {
            throw new RuntimeException('A integração fiscal do SaaS não está ativa.');
        }

        foreach (['cnpj', 'municipal_registration', 'service_city_code', 'service_list_item'] as $field) {
            if (blank($setting->{$field})) {
                throw new RuntimeException('Complete as configurações fiscais do SaaS antes de emitir NFS-e.');
            }
        }

        return $setting;
    }

    private function createProcessingDocument(Tenant $tenant, AdminFiscalSetting $setting, float $amount, string $description, ?Payment $payment): AdminFiscalDocument
    {
        $document = AdminFiscalDocument::create([
            'tenant_id' => $tenant->id,
            'payment_id' => $payment?->id,
            'type' => 'nfse',
            'provider' => 'focus_nfe',
            'environment' => $setting->environment,
            'status' => 'processing',
            'amount' => $amount,
            'description' => $description,
            'registered_by' => Auth::id(),
            'error_message' => null,
        ]);

        $document->update([
            'provider_reference' => sprintf('saas-nfse-%s-%s', $tenant->id, $document->id),
        ]);

        return $document->fresh();
    }

    private function sendAndUpdate(
        AdminFiscalDocument $document,
        string $endpoint,
        string $reference,
        array $payload,
        AdminFiscalSetting $setting
    ): AdminFiscalDocument {
        $response = $this->post($endpoint, $reference, $payload, $setting);

        return $this->updateFromFocusResponse($document, $response, $payload);
    }

    private function updateFromFocusResponse(AdminFiscalDocument $document, Response $response, ?array $requestPayload = null): AdminFiscalDocument
    {
        $body = $response->json() ?? [];

        if ($response->successful()) {
            $document->update([
                'status' => $this->statusFromResponse($body, 'processing'),
                'number' => $body['numero'] ?? $body['numero_nfse'] ?? null,
                'series' => $body['serie'] ?? null,
                'access_key' => $body['chave_nfe'] ?? $body['codigo_verificacao'] ?? null,
                'pdf_url' => $body['caminho_danfe'] ?? $body['url_danfe'] ?? $body['url'] ?? null,
                'xml_url' => $body['caminho_xml_nota_fiscal'] ?? $body['url_xml'] ?? null,
                'issued_at' => now(),
                'request_payload' => $requestPayload ?? $document->request_payload,
                'response_payload' => $body,
                'error_message' => null,
            ]);

            return $document->fresh();
        }

        $message = $body['mensagem'] ?? $body['message'] ?? $body['erro'] ?? $response->body();

        $document->update([
            'status' => 'error',
            'request_payload' => $requestPayload ?? $document->request_payload,
            'response_payload' => $body ?: ['raw' => $response->body()],
            'error_message' => Str::limit((string) $message, 2000, ''),
        ]);

        throw new RuntimeException('Focus NFe retornou erro para o documento: '.Str::limit((string) $message, 500, ''));
    }

    private function buildNfsePayload(Tenant $tenant, AdminFiscalSetting $setting, float $amount, string $description): array
    {
        return [
            'data_emissao' => now()->toIso8601String(),
            'prestador' => [
                'cnpj' => $this->digits($setting->cnpj),
                'inscricao_municipal' => $setting->municipal_registration,
                'codigo_municipio' => $setting->service_city_code,
            ],
            'tomador' => [
                strlen($this->digits($tenant->cnpj)) === 14 ? 'cnpj' : 'cpf' => $this->digits($tenant->cnpj),
                'razao_social' => $tenant->company ?: $tenant->name,
                'email' => $tenant->email,
                'endereco' => [
                    'logradouro' => $tenant->street,
                    'numero' => $tenant->number,
                    'bairro' => $tenant->district,
                    'codigo_municipio' => null,
                    'uf' => $tenant->state,
                    'cep' => $this->digits($tenant->zip_code),
                ],
            ],
            'servico' => [
                'aliquota' => $setting->default_iss_rate ? (float) $setting->default_iss_rate : 0,
                'discriminacao' => $description,
                'iss_retido' => false,
                'item_lista_servico' => $setting->service_list_item,
                'valor_servicos' => round($amount, 2),
            ],
        ];
    }

    private function serviceDescription(AdminFiscalSetting $setting, Tenant $tenant, ?string $description): string
    {
        if (filled($description)) {
            return trim((string) $description);
        }

        if (filled($setting->default_service_description)) {
            return str_replace(
                ['{{ empresa }}', '{{ plano }}'],
                [$tenant->company ?: $tenant->name, $tenant->plan?->name ?? 'assinatura'],
                $setting->default_service_description
            );
        }

        return 'Assinatura VetorOS'.($tenant->plan?->name ? ' - '.$tenant->plan->name : '');
    }

    private function post(string $endpoint, string $reference, array $payload, AdminFiscalSetting $setting): Response
    {
        return Http::acceptJson()
            ->asJson()
            ->withBasicAuth($setting->api_token, '')
            ->timeout(30)
            ->post(self::BASE_URL.'/'.$endpoint.'?ref='.urlencode($reference), $payload);
    }

    private function get(string $endpoint, string $reference, AdminFiscalSetting $setting): Response
    {
        return Http::acceptJson()
            ->withBasicAuth($setting->api_token, '')
            ->timeout(30)
            ->get(self::BASE_URL.'/'.$endpoint.'/'.urlencode($reference));
    }

    private function statusFromResponse(array $body, string $fallback): string
    {
        return Str::lower((string) ($body['status'] ?? $body['situacao'] ?? $fallback));
    }

    private function digits(?string $value): string
    {
        return preg_replace('/\D+/', '', (string) $value) ?? '';
    }
}
