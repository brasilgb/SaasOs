<?php

namespace App\Services;

use App\Models\App\Company;
use App\Models\App\FiscalDocument;
use App\Models\App\FiscalSetting;
use App\Models\App\Order;
use App\Models\App\Sale;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class FocusNfeService
{
    private const BASE_URL = 'https://api.focusnfe.com.br/v2';

    public function issueSaleNfe(Sale $sale): FiscalDocument
    {
        $setting = $this->activeSetting('nfe_enabled');
        $sale->loadMissing(['customer', 'items.part']);

        $document = $this->createProcessingDocument($sale, 'nfe', $setting);
        $payload = $this->buildNfePayload($sale, $setting);

        return $this->sendAndUpdate($document, 'nfe', $document->provider_reference, $payload, $setting);
    }

    public function issueOrderNfse(Order $order): FiscalDocument
    {
        $setting = $this->activeSetting('nfse_enabled');
        $order->loadMissing(['customer']);

        $document = $this->createProcessingDocument($order, 'nfse', $setting);
        $payload = $this->buildNfsePayload($order, $setting);

        return $this->sendAndUpdate($document, 'nfse', $document->provider_reference, $payload, $setting);
    }

    private function activeSetting(string $feature): FiscalSetting
    {
        $setting = FiscalSetting::query()->first();

        if (! $setting || ! $setting->enabled || ! $setting->{$feature} || empty($setting->api_token)) {
            throw new RuntimeException('A integração Focus NFe não está ativa para este tipo de documento.');
        }

        return $setting;
    }

    private function createProcessingDocument(Order|Sale $model, string $type, FiscalSetting $setting): FiscalDocument
    {
        $reference = sprintf('%s-%s-%s', $type, $model->tenant_id, $model->id);

        return FiscalDocument::updateOrCreate(
            [
                'documentable_type' => $model::class,
                'documentable_id' => $model->id,
                'provider' => 'focus_nfe',
            ],
            [
                'tenant_id' => $model->tenant_id,
                'type' => $type,
                'environment' => $setting->environment,
                'provider_reference' => $reference,
                'status' => 'processing',
                'registered_by' => Auth::id(),
                'error_message' => null,
            ]
        );
    }

    private function sendAndUpdate(FiscalDocument $document, string $endpoint, string $reference, array $payload, FiscalSetting $setting): FiscalDocument
    {
        $response = $this->post($endpoint, $reference, $payload, $setting);
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
                'request_payload' => $payload,
                'response_payload' => $body,
            ]);

            return $document->fresh();
        }

        $message = $body['mensagem'] ?? $body['message'] ?? $body['erro'] ?? $response->body();

        $document->update([
            'status' => 'error',
            'request_payload' => $payload,
            'response_payload' => $body ?: ['raw' => $response->body()],
            'error_message' => Str::limit((string) $message, 2000, ''),
        ]);

        throw new RuntimeException('Focus NFe recusou a emissão: '.Str::limit((string) $message, 500, ''));
    }

    private function post(string $endpoint, string $reference, array $payload, FiscalSetting $setting): Response
    {
        return Http::acceptJson()
            ->asJson()
            ->withBasicAuth($setting->api_token, '')
            ->timeout(30)
            ->post(self::BASE_URL.'/'.$endpoint.'?ref='.urlencode($reference), $payload);
    }

    private function buildNfePayload(Sale $sale, FiscalSetting $setting): array
    {
        $company = $this->company();
        $customer = $sale->customer;
        $items = $sale->items;

        if ($items->isEmpty()) {
            throw new RuntimeException('A venda não possui itens para emissão da NF-e.');
        }

        if (blank($setting->default_ncm) || blank($setting->default_cfop)) {
            throw new RuntimeException('Configure NCM e CFOP padrão antes de emitir NF-e pela Focus.');
        }

        $totalProducts = (float) $items->sum(fn ($item) => (float) $item->unit_price * (int) $item->quantity);

        return [
            'natureza_operacao' => 'Venda',
            'data_emissao' => now()->toIso8601String(),
            'tipo_documento' => 1,
            'local_destino' => 1,
            'finalidade_emissao' => 1,
            'consumidor_final' => 1,
            'presenca_comprador' => 1,
            ...$this->emitentePayload($company, $setting),
            ...$this->destinatarioPayload($customer),
            'valor_frete' => 0,
            'valor_seguro' => 0,
            'valor_desconto' => 0,
            'valor_outras_despesas' => 0,
            'valor_produtos' => round($totalProducts, 2),
            'valor_total' => round((float) ($sale->total_amount ?? $totalProducts), 2),
            'modalidade_frete' => 9,
            'items' => $items->values()->map(fn ($item, $index) => $this->nfeItemPayload($item, $index + 1, $setting))->all(),
        ];
    }

    private function buildNfsePayload(Order $order, FiscalSetting $setting): array
    {
        $company = $this->company();

        if (blank($setting->service_city_code) || blank($setting->service_list_item)) {
            throw new RuntimeException('Configure código do município e item da lista de serviço antes de emitir NFS-e pela Focus.');
        }

        return [
            'data_emissao' => now()->toIso8601String(),
            'prestador' => [
                'cnpj' => $this->digits($company->cnpj),
                'inscricao_municipal' => $setting->municipal_registration,
                'codigo_municipio' => $setting->service_city_code,
            ],
            'tomador' => $this->tomadorPayload($order->customer),
            'servico' => [
                'aliquota' => $setting->default_iss_rate ? (float) $setting->default_iss_rate : 0,
                'discriminacao' => $order->services_performed ?: 'Serviços prestados na ordem #'.$order->order_number,
                'iss_retido' => false,
                'item_lista_servico' => $setting->service_list_item,
                'valor_servicos' => round((float) ($order->service_value ?? $order->service_cost ?? 0), 2),
            ],
        ];
    }

    private function company(): Company
    {
        $company = Company::query()->first();

        if (! $company) {
            throw new RuntimeException('Cadastre os dados da empresa antes de emitir documentos fiscais.');
        }

        return $company;
    }

    private function emitentePayload(Company $company, FiscalSetting $setting): array
    {
        return [
            'cnpj_emitente' => $this->digits($company->cnpj),
            'nome_emitente' => $company->companyname,
            'nome_fantasia_emitente' => $company->shortname,
            'logradouro_emitente' => $company->street,
            'numero_emitente' => $company->number,
            'bairro_emitente' => $company->district,
            'municipio_emitente' => $company->city,
            'uf_emitente' => $company->state,
            'cep_emitente' => $this->digits($company->zip_code),
            'inscricao_estadual_emitente' => $setting->state_registration,
            'regime_tributario_emitente' => (int) ($setting->company_tax_regime ?: 1),
        ];
    }

    private function destinatarioPayload($customer): array
    {
        $document = $this->digits($customer?->cpfcnpj);
        $isCnpj = strlen($document) === 14;

        return [
            'nome_destinatario' => $customer?->name ?: 'Consumidor final',
            $isCnpj ? 'cnpj_destinatario' : 'cpf_destinatario' => $document,
            'indicador_inscricao_estadual_destinatario' => 9,
            'logradouro_destinatario' => $customer?->street,
            'numero_destinatario' => $customer?->number,
            'bairro_destinatario' => $customer?->district,
            'municipio_destinatario' => $customer?->city,
            'uf_destinatario' => $customer?->state,
            'cep_destinatario' => $this->digits($customer?->zipcode),
            'pais_destinatario' => 'Brasil',
            'telefone_destinatario' => $this->digits($customer?->phone),
        ];
    }

    private function tomadorPayload($customer): array
    {
        $document = $this->digits($customer?->cpfcnpj);

        return [
            strlen($document) === 14 ? 'cnpj' : 'cpf' => $document,
            'razao_social' => $customer?->name,
            'email' => $customer?->email,
            'endereco' => [
                'logradouro' => $customer?->street,
                'numero' => $customer?->number,
                'bairro' => $customer?->district,
                'codigo_municipio' => null,
                'uf' => $customer?->state,
                'cep' => $this->digits($customer?->zipcode),
            ],
        ];
    }

    private function nfeItemPayload($item, int $number, FiscalSetting $setting): array
    {
        $quantity = (int) $item->quantity;
        $unitPrice = (float) $item->unit_price;
        $part = $item->part;

        return [
            'numero_item' => $number,
            'codigo_produto' => (string) ($part?->part_number ?? $item->part_id),
            'descricao' => $part?->name ?? 'Produto',
            'cfop' => $setting->default_cfop,
            'unidade_comercial' => $setting->default_commercial_unit ?: 'UN',
            'quantidade_comercial' => $quantity,
            'valor_unitario_comercial' => $unitPrice,
            'valor_bruto' => round($quantity * $unitPrice, 2),
            'unidade_tributavel' => $setting->default_tax_unit ?: 'UN',
            'quantidade_tributavel' => $quantity,
            'valor_unitario_tributavel' => $unitPrice,
            'codigo_ncm' => $setting->default_ncm,
            'icms_origem' => $setting->default_icms_origin ?: '0',
            'icms_situacao_tributaria' => $setting->default_icms_situation ?: '102',
            'pis_situacao_tributaria' => $setting->default_pis_situation ?: '99',
            'cofins_situacao_tributaria' => $setting->default_cofins_situation ?: '99',
        ];
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
