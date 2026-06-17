<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\FiscalDocument;
use App\Models\App\FiscalSetting;
use App\Models\App\Order;
use App\Models\App\Sale;
use App\Services\FiscalDocumentService;
use App\Services\FocusNfeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FiscalDocumentController extends Controller
{
    public function __construct(
        private readonly FiscalDocumentService $fiscalDocumentService,
        private readonly FocusNfeService $focusNfeService
    ) {}

    public function index(): Response
    {
        Gate::authorize('fiscal-documents.access');

        $documents = FiscalDocument::query()
            ->latest()
            ->limit(20)
            ->get([
                'id',
                'documentable_type',
                'documentable_id',
                'type',
                'provider',
                'number',
                'status',
                'pdf_url',
                'xml_url',
                'issued_at',
                'created_at',
            ]);

        return Inertia::render('app/fiscal-documents/index', ['documents' => $documents]);
    }

    public function settings(): Response
    {
        Gate::authorize('fiscal-documents.access');

        $setting = FiscalSetting::query()->firstOrCreate([], [
            'provider' => 'focus_nfe',
            'environment' => 'sandbox',
        ]);

        return Inertia::render('app/fiscal-documents/settings', [
            'fiscalSetting' => $this->settingPayload($setting),
        ]);
    }

    public function update(Request $request, FiscalSetting $fiscalSetting): RedirectResponse
    {
        Gate::authorize('fiscal-documents.access');

        $request->merge([
            'environment' => $this->normalizeEnvironment($request->input('environment')),
            'default_iss_rate' => $this->normalizeNullableDecimal($request->input('default_iss_rate')),
        ]);

        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
            'environment' => ['required', 'in:sandbox,production'],
            'api_token' => [Rule::requiredIf(fn () => $request->boolean('enabled') && empty($fiscalSetting->api_token)), 'nullable', 'string', 'max:4000'],
            'webhook_secret' => ['nullable', 'string', 'max:4000'],
            'nfe_enabled' => ['required', 'boolean'],
            'nfse_enabled' => ['required', 'boolean'],
            'company_tax_regime' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfe_enabled')), 'nullable', 'string', 'max:50'],
            'state_registration' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfe_enabled')), 'nullable', 'string', 'max:50'],
            'municipal_registration' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfse_enabled')), 'nullable', 'string', 'max:50'],
            'service_city_code' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfse_enabled')), 'nullable', 'string', 'max:20'],
            'service_list_item' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfse_enabled')), 'nullable', 'string', 'max:30'],
            'default_iss_rate' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfse_enabled')), 'nullable', 'numeric', 'min:0', 'max:100'],
            'default_nfe_series' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfe_enabled')), 'nullable', 'string', 'max:20'],
            'default_nfse_series' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfse_enabled')), 'nullable', 'string', 'max:20'],
            'default_ncm' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfe_enabled')), 'nullable', 'string', 'max:20'],
            'default_cfop' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfe_enabled')), 'nullable', 'string', 'max:10'],
            'default_commercial_unit' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfe_enabled')), 'nullable', 'string', 'max:10'],
            'default_tax_unit' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfe_enabled')), 'nullable', 'string', 'max:10'],
            'default_icms_origin' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfe_enabled')), 'nullable', 'string', 'max:5'],
            'default_icms_situation' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfe_enabled')), 'nullable', 'string', 'max:10'],
            'default_pis_situation' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfe_enabled')), 'nullable', 'string', 'max:10'],
            'default_cofins_situation' => [Rule::requiredIf(fn () => $request->boolean('enabled') && $request->boolean('nfe_enabled')), 'nullable', 'string', 'max:10'],
        ], [], [
            'api_token' => 'token Focus NFe',
            'nfe_enabled' => 'NF-e de produtos',
            'nfse_enabled' => 'NFS-e de serviços',
            'company_tax_regime' => 'regime tributário',
            'state_registration' => 'inscrição estadual',
            'municipal_registration' => 'inscrição municipal',
            'service_city_code' => 'código do município',
            'service_list_item' => 'item da lista de serviço',
            'default_iss_rate' => 'alíquota ISS padrão',
            'default_nfe_series' => 'série NF-e',
            'default_nfse_series' => 'série NFS-e',
            'default_ncm' => 'NCM padrão',
            'default_cfop' => 'CFOP padrão',
            'default_commercial_unit' => 'unidade comercial',
            'default_tax_unit' => 'unidade tributável',
            'default_icms_origin' => 'origem ICMS',
            'default_icms_situation' => 'situação ICMS',
            'default_pis_situation' => 'situação PIS',
            'default_cofins_situation' => 'situação COFINS',
        ]);

        if ($data['enabled'] && ! $data['nfe_enabled'] && ! $data['nfse_enabled']) {
            return back()
                ->withErrors(['nfe_enabled' => 'Habilite NF-e, NFS-e ou ambas para ativar documentos fiscais.'])
                ->withInput();
        }

        $data['provider'] = 'focus_nfe';

        if (blank($data['api_token'] ?? null)) {
            unset($data['api_token']);
        }

        if (blank($data['webhook_secret'] ?? null)) {
            unset($data['webhook_secret']);
        }

        $fiscalSetting->update($data);

        return redirect()->route('app.fiscal-documents.settings')->with('success', 'Configurações fiscais salvas com sucesso.');
    }

    public function updateEnabled(Request $request, FiscalSetting $fiscalSetting): RedirectResponse
    {
        Gate::authorize('fiscal-documents.access');

        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
        ]);

        $fiscalSetting->update([
            'provider' => 'focus_nfe',
            'enabled' => $data['enabled'],
        ]);

        return back()->with('success', $data['enabled'] ? 'Documentos fiscais ativados.' : 'Documentos fiscais desativados.');
    }

    public function updateToken(Request $request, FiscalSetting $fiscalSetting): RedirectResponse
    {
        Gate::authorize('fiscal-documents.access');

        $data = $request->validate([
            'api_token' => ['required', 'string', 'max:4000'],
        ], [], [
            'api_token' => 'token Focus NFe',
        ]);

        $fiscalSetting->update([
            'provider' => 'focus_nfe',
            'api_token' => $data['api_token'],
        ]);

        return back()->with('success', 'Token Focus NFe salvo com sucesso.');
    }

    public function testConnection(Request $request, FiscalSetting $fiscalSetting): RedirectResponse
    {
        Gate::authorize('fiscal-documents.access');

        $data = $request->validate([
            'api_token' => ['nullable', 'string', 'max:4000'],
        ]);

        try {
            $this->focusNfeService->testConnection($fiscalSetting, $data['api_token'] ?? null);
        } catch (\RuntimeException $exception) {
            return back()
                ->withErrors(['api_token' => $exception->getMessage()])
                ->withInput();
        }

        return back()->with('success', 'Conexão com a Focus NFe testada com sucesso.');
    }

    private function normalizeNullableDecimal(mixed $value): mixed
    {
        if (blank($value)) {
            return null;
        }

        if (is_string($value)) {
            return str_replace(',', '.', trim($value));
        }

        return $value;
    }

    private function normalizeEnvironment(mixed $value): string
    {
        return match ($value) {
            'production', 'producao', 'produção' => 'production',
            default => 'sandbox',
        };
    }

    public function issueOrder(Order $order): RedirectResponse
    {
        Gate::authorize('fiscal-documents.access');
        $this->authorize('update', $order);

        if (round((float) ($order->service_cost ?? 0), 2) <= 0) {
            return back()->with('error', 'Informe um valor maior que zero na ordem antes de emitir a NFS-e.');
        }

        try {
            $document = $this->fiscalDocumentService->issueOrderNfse($order);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'NFS-e enviada para processamento na Focus NFe. Referência: '.$document->provider_reference);
    }

    public function issueSale(Sale $sale): RedirectResponse
    {
        Gate::authorize('fiscal-documents.access');
        $this->authorize('update', $sale);

        if (round((float) ($sale->total_amount ?? 0), 2) <= 0) {
            return back()->with('error', 'Informe um valor maior que zero na venda antes de emitir a NF-e.');
        }

        try {
            $document = $this->fiscalDocumentService->issueSaleNfe($sale);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'NF-e enviada para processamento na Focus NFe. Referência: '.$document->provider_reference);
    }

    public function sync(FiscalDocument $fiscalDocument): RedirectResponse
    {
        Gate::authorize('fiscal-documents.access');

        try {
            $document = $this->fiscalDocumentService->sync($fiscalDocument);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Documento fiscal sincronizado com a Focus NFe. Status: '.$document->status);
    }

    private function settingPayload(FiscalSetting $setting): array
    {
        return [
            ...$setting->only([
                'id',
                'enabled',
                'provider',
                'api_token',
                'nfe_enabled',
                'nfse_enabled',
                'company_tax_regime',
                'state_registration',
                'municipal_registration',
                'service_city_code',
                'service_list_item',
                'default_iss_rate',
                'default_nfe_series',
                'default_nfse_series',
                'default_ncm',
                'default_cfop',
                'default_commercial_unit',
                'default_tax_unit',
                'default_icms_origin',
                'default_icms_situation',
                'default_pis_situation',
                'default_cofins_situation',
            ]),
            'environment' => $this->normalizeEnvironment($setting->environment),
            'has_api_token' => ! empty($setting->api_token),
            'has_webhook_secret' => ! empty($setting->webhook_secret),
        ];
    }
}
