<?php

namespace App\Services;

use App\Models\App\Company;
use App\Models\App\FiscalDocument;
use App\Models\App\FiscalSetting;
use App\Models\App\Order;
use App\Models\App\Sale;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class FocusNfeService
{
    private const PRODUCTION_BASE_URL = 'https://api.focusnfe.com.br/v2';

    private const HOMOLOGATION_BASE_URL = 'https://homologacao.focusnfe.com.br/v2';

    private const CONNECTION_TEST_REFERENCE = '__vetoros_connection_test__';

    public function testConnection(FiscalSetting $setting, ?string $apiToken = null): void
    {
        $token = filled($apiToken) ? trim((string) $apiToken) : $setting->api_token;

        if (blank($token)) {
            throw new RuntimeException('Informe o token Focus NFe antes de testar a conexão.');
        }

        $endpoint = $setting->nfe_enabled
            ? 'nfe'
            : ($setting->nfse_mode === 'national' ? 'nfsen' : 'nfse');
        $response = Http::acceptJson()
            ->withBasicAuth($token, '')
            ->timeout(15)
            ->get($this->baseUrl($setting).'/'.$endpoint.'/'.self::CONNECTION_TEST_REFERENCE);

        if ($response->successful() || $response->status() === 404) {
            return;
        }

        $body = $response->json() ?? [];
        $message = $body['mensagem'] ?? $body['message'] ?? $body['erro'] ?? $response->body();

        throw new RuntimeException('Não foi possível autenticar na Focus NFe: '.Str::limit((string) $message, 500, ''));
    }

    public function issueSaleNfe(Sale $sale): FiscalDocument
    {
        $setting = $this->activeSetting('nfe_enabled');
        $sale->loadMissing(['customer', 'items.part']);

        if (round((float) ($sale->total_amount ?? 0), 2) <= 0) {
            throw new RuntimeException('Informe um valor maior que zero na venda antes de emitir a NF-e.');
        }

        $document = $this->createProcessingDocument($sale, 'nfe', $setting);
        $payload = $this->buildNfePayload($sale, $setting);

        return $this->sendAndUpdate($document, 'nfe', $document->provider_reference, $payload, $setting);
    }

    public function issueOrderNfse(Order $order): FiscalDocument
    {
        $setting = $this->activeSetting('nfse_enabled');
        $order->loadMissing(['customer']);

        if (round((float) ($order->service_cost ?? 0), 2) <= 0) {
            throw new RuntimeException('Informe um valor maior que zero na ordem antes de emitir a NFS-e.');
        }

        $endpoint = $setting->nfse_mode === 'national' ? 'nfsen' : 'nfse';
        $document = $this->createProcessingDocument($order, 'nfse', $setting, $endpoint);
        $payload = $endpoint === 'nfsen'
            ? $this->buildNationalNfsePayload($order, $setting)
            : $this->buildNfsePayload($order, $setting);

        return $this->sendAndUpdate($document, $endpoint, $document->provider_reference, $payload, $setting);
    }

    public function refreshDocument(FiscalDocument $document): FiscalDocument
    {
        if ($document->provider !== 'focus_nfe' || blank($document->provider_reference)) {
            throw new RuntimeException('Documento fiscal sem referência válida da Focus NFe.');
        }

        $endpoint = match ($document->type) {
            'nfe' => 'nfe',
            'nfse' => Str::startsWith((string) $document->provider_reference, 'nfsen-') ? 'nfsen' : 'nfse',
            default => throw new RuntimeException('Tipo de documento fiscal não suportado para consulta na Focus NFe.'),
        };

        $setting = $this->activeSetting($endpoint === 'nfe' ? 'nfe_enabled' : 'nfse_enabled');
        $response = $this->get($endpoint, $document->provider_reference, $setting);

        return $this->updateFromFocusResponse($document, $response);
    }

    private function activeSetting(string $feature): FiscalSetting
    {
        $setting = FiscalSetting::query()->first();

        if (! $setting || ! $setting->enabled || ! $setting->{$feature} || empty($setting->api_token)) {
            throw new RuntimeException('A integração Focus NFe não está ativa para este tipo de documento.');
        }

        return $setting;
    }

    private function createProcessingDocument(Order|Sale $model, string $type, FiscalSetting $setting, ?string $referenceType = null): FiscalDocument
    {
        $reference = sprintf('%s-%s-%s', $referenceType ?? $type, $model->tenant_id, $model->id);

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

        if ($response->failed()) {
            Log::error('Falha na emissão de documento fiscal pela Focus NFe.', [
                'tenant_id' => $document->tenant_id,
                'fiscal_document_id' => $document->id,
                'document_type' => $document->type,
                'environment' => $setting->environment,
                'endpoint' => $endpoint,
                'reference' => $reference,
                'http_status' => $response->status(),
                'request_payload' => $payload,
                'response_payload' => $response->json() ?? ['raw' => $response->body()],
            ]);
        }

        return $this->updateFromFocusResponse($document, $response, $payload);
    }

    private function updateFromFocusResponse(FiscalDocument $document, Response $response, ?array $requestPayload = null): FiscalDocument
    {
        $body = $response->json() ?? [];

        if ($response->successful()) {
            $status = $this->statusFromResponse($body, 'processing');
            $businessError = in_array($status, ['erro_autorizacao', 'negado', 'rejeitado', 'erro'], true);
            $errorMessage = $businessError ? $this->focusErrorMessage($body) : null;

            if ($businessError) {
                Log::error('Documento fiscal rejeitado durante a autorização pela Focus NFe.', [
                    'tenant_id' => $document->tenant_id,
                    'fiscal_document_id' => $document->id,
                    'document_type' => $document->type,
                    'environment' => $document->environment,
                    'reference' => $document->provider_reference,
                    'focus_status' => $status,
                    'error_message' => $errorMessage,
                    'request_payload' => $requestPayload ?? $document->request_payload,
                    'response_payload' => $body,
                ]);
            }

            $number = $body['numero'] ?? $body['numero_nfse'] ?? null;
            $accessKey = $body['chave_nfe'] ?? $body['codigo_verificacao'] ?? null;
            $pdfUrl = $this->normalizeFocusFileUrl(
                $body['caminho_danfe'] ?? $body['url_danfe'] ?? $body['url_danfse'] ?? $body['url'] ?? null,
                $document->environment
            );
            $xmlUrl = $this->normalizeFocusFileUrl(
                $body['caminho_xml_nota_fiscal'] ?? $body['url_xml'] ?? null,
                $document->environment
            );
            $issuedAt = now();

            $document->update([
                'status' => $status,
                'number' => $number,
                'series' => $body['serie'] ?? null,
                'access_key' => $accessKey,
                'pdf_url' => $pdfUrl,
                'xml_url' => $xmlUrl,
                'issued_at' => $issuedAt,
                'request_payload' => $requestPayload ?? $document->request_payload,
                'response_payload' => $body,
                'error_message' => $errorMessage,
            ]);

            $this->updateDocumentableFiscalFields($document, $number, $accessKey, $pdfUrl, $issuedAt);

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

    private function updateDocumentableFiscalFields(FiscalDocument $document, ?string $number, ?string $accessKey, ?string $pdfUrl, Carbon $issuedAt): void
    {
        if (blank($number) && blank($accessKey) && blank($pdfUrl)) {
            return;
        }

        $documentable = $document->documentable;

        if (! $documentable instanceof Order && ! $documentable instanceof Sale) {
            return;
        }

        $documentable->update([
            'fiscal_document_number' => $number ?: $documentable->fiscal_document_number,
            'fiscal_document_key' => $accessKey ?: $documentable->fiscal_document_key,
            'fiscal_document_url' => $pdfUrl ?: $documentable->fiscal_document_url,
            'fiscal_issued_at' => $issuedAt,
            'fiscal_registered_by' => Auth::id(),
            'fiscal_notes' => 'Emitido via Focus NFe. Referência: '.$document->provider_reference,
        ]);
    }

    private function post(string $endpoint, string $reference, array $payload, FiscalSetting $setting): Response
    {
        return Http::acceptJson()
            ->asJson()
            ->withBasicAuth($setting->api_token, '')
            ->timeout(30)
            ->post($this->baseUrl($setting).'/'.$endpoint.'?ref='.urlencode($reference), $payload);
    }

    private function get(string $endpoint, string $reference, FiscalSetting $setting): Response
    {
        return Http::acceptJson()
            ->withBasicAuth($setting->api_token, '')
            ->timeout(30)
            ->get($this->baseUrl($setting).'/'.$endpoint.'/'.urlencode($reference));
    }

    private function baseUrl(FiscalSetting $setting): string
    {
        return $setting->environment === 'production'
            ? self::PRODUCTION_BASE_URL
            : self::HOMOLOGATION_BASE_URL;
    }

    private function buildNfePayload(Sale $sale, FiscalSetting $setting): array
    {
        $company = $this->company();
        $customer = $sale->customer;
        $items = $sale->items;

        $this->validateNfeParties($company, $customer, $setting);

        if ($items->isEmpty()) {
            throw new RuntimeException('A venda não possui itens para emissão da NF-e.');
        }

        $itemWithoutFiscalClassification = $items->first(
            fn ($item) => blank($item->part?->ncm) || blank($item->part?->cfop)
        );

        if ($itemWithoutFiscalClassification) {
            $description = $itemWithoutFiscalClassification->part?->name ?? 'Produto';

            throw new RuntimeException("Configure o NCM e o CFOP do produto {$description} antes de emitir a NF-e pela Focus.");
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
                'valor_servicos' => round((float) ($order->service_cost ?? 0), 2),
            ],
        ];
    }

    private function buildNationalNfsePayload(Order $order, FiscalSetting $setting): array
    {
        $company = $this->company();
        $customer = $order->customer;
        $serviceCode = $this->digits($setting->service_list_item);

        if (strlen($serviceCode) === 4) {
            $serviceCode .= '00';
        }

        if (strlen($serviceCode) !== 6 || strlen($this->digits($setting->service_city_code)) !== 7) {
            throw new RuntimeException('Na NFS-e Nacional, informe o código IBGE com 7 dígitos e o código de tributação nacional do ISS com 6 dígitos.');
        }

        $customerDocument = $this->digits($customer?->cpfcnpj);

        if (! in_array(strlen($customerDocument), [11, 14], true)) {
            throw new RuntimeException('Informe um CPF ou CNPJ válido para o tomador da NFS-e Nacional.');
        }

        $payload = [
            'data_emissao' => now()->toIso8601String(),
            'serie_dps' => max(1, (int) $setting->default_nfse_series),
            'numero_dps' => $order->id,
            'data_competencia' => now()->toDateString(),
            'emitente_dps' => 1,
            'codigo_municipio_emissora' => (int) $this->digits($setting->service_city_code),
            'cnpj_prestador' => $this->digits($company->cnpj),
            'inscricao_municipal_prestador' => $setting->municipal_registration,
            'codigo_opcao_simples_nacional' => (int) $setting->nfse_simple_option,
            'regime_especial_tributacao' => (int) $setting->nfse_special_tax_regime,
            strlen($customerDocument) === 14 ? 'cnpj_tomador' : 'cpf_tomador' => $customerDocument,
            'razao_social_tomador' => $customer?->name,
            'email_tomador' => $customer?->email,
            'codigo_municipio_prestacao' => $this->digits($setting->service_city_code),
            'codigo_tributacao_nacional_iss' => $serviceCode,
            'descricao_servico' => $order->services_performed ?: 'Serviços prestados na ordem #'.$order->order_number,
            'valor_servico' => round((float) ($order->service_cost ?? 0), 2),
            'tributacao_iss' => 1,
            'tipo_retencao_iss' => 1,
            'indicador_total_tributacao' => 0,
            'finalidade_emissao' => 0,
            'consumidor_final' => 0,
            'codigo_indicador_operacao' => $setting->nfse_operation_indicator,
            'indicador_destinatario' => 0,
            'ibs_cbs_situacao_tributaria' => $setting->nfse_ibs_cbs_situation,
            'ibs_cbs_classificacao_tributaria' => $setting->nfse_ibs_cbs_classification,
        ];

        return $payload;
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
            'inscricao_estadual_emitente' => $this->digits($setting->state_registration),
            'regime_tributario_emitente' => (int) ($setting->company_tax_regime ?: 1),
        ];
    }

    private function validateNfeParties(Company $company, $customer, FiscalSetting $setting): void
    {
        $missing = [];

        foreach ([
            'logradouro do emitente' => $company->street,
            'número do emitente' => $company->number,
            'bairro do emitente' => $company->district,
            'município do emitente' => $company->city,
            'UF do emitente' => $company->state,
            'CEP do emitente' => $company->zip_code,
            'inscrição estadual do emitente' => $setting->state_registration,
            'nome do destinatário' => $customer?->name,
            'logradouro do destinatário' => $customer?->street,
            'número do destinatário' => $customer?->number,
            'bairro do destinatário' => $customer?->district,
            'município do destinatário' => $customer?->city,
            'UF do destinatário' => $customer?->state,
            'CEP do destinatário' => $customer?->zipcode,
        ] as $label => $value) {
            if (blank($value)) {
                $missing[] = $label;
            }
        }

        $document = $this->digits($customer?->cpfcnpj);

        if (! in_array(strlen($document), [11, 14], true)) {
            $missing[] = 'CPF ou CNPJ válido do destinatário';
        }

        if (! in_array((int) $setting->company_tax_regime, [1, 2, 3], true)) {
            $missing[] = 'regime tributário do emitente (use 1, 2 ou 3)';
        }

        if ($missing !== []) {
            throw new RuntimeException('Complete os dados obrigatórios da NF-e antes de emitir: '.implode(', ', $missing).'.');
        }
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
            'cfop' => $part->cfop,
            'unidade_comercial' => $setting->default_commercial_unit ?: 'UN',
            'quantidade_comercial' => $quantity,
            'valor_unitario_comercial' => $unitPrice,
            'valor_bruto' => round($quantity * $unitPrice, 2),
            'unidade_tributavel' => $setting->default_tax_unit ?: 'UN',
            'quantidade_tributavel' => $quantity,
            'valor_unitario_tributavel' => $unitPrice,
            'codigo_ncm' => $part->ncm,
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

    private function focusErrorMessage(array $body): string
    {
        $messages = collect($body['erros'] ?? [])
            ->map(fn ($error) => is_array($error) ? ($error['mensagem'] ?? $error['message'] ?? null) : $error)
            ->filter()
            ->implode(' | ');

        return (string) ($body['mensagem']
            ?? $body['message']
            ?? $body['mensagem_sefaz']
            ?? $body['erro']
            ?? ($messages ?: 'A Focus NFe não informou o motivo detalhado da rejeição.'));
    }

    private function normalizeFocusFileUrl(?string $url, ?string $environment): ?string
    {
        if (blank($url) || Str::startsWith($url, ['http://', 'https://'])) {
            return $url;
        }

        $origin = $environment === 'production'
            ? 'https://api.focusnfe.com.br'
            : 'https://homologacao.focusnfe.com.br';

        return $origin.'/'.ltrim($url, '/');
    }

    private function digits(?string $value): string
    {
        return preg_replace('/\D+/', '', (string) $value) ?? '';
    }
}
