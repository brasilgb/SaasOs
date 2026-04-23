<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\FiscalDocument;
use App\Models\App\FiscalSetting;
use App\Models\App\Order;
use App\Models\App\Sale;
use App\Services\FocusNfeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class FiscalDocumentController extends Controller
{
    public function __construct(private readonly FocusNfeService $focusNfeService)
    {
    }

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

        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
            'environment' => ['required', 'in:sandbox,production'],
            'api_token' => ['nullable', 'string', 'max:4000'],
            'webhook_secret' => ['nullable', 'string', 'max:4000'],
            'nfe_enabled' => ['required', 'boolean'],
            'nfse_enabled' => ['required', 'boolean'],
            'company_tax_regime' => ['nullable', 'string', 'max:50'],
            'state_registration' => ['nullable', 'string', 'max:50'],
            'municipal_registration' => ['nullable', 'string', 'max:50'],
            'service_city_code' => ['nullable', 'string', 'max:20'],
            'service_list_item' => ['nullable', 'string', 'max:30'],
            'default_iss_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'default_nfe_series' => ['nullable', 'string', 'max:20'],
            'default_nfse_series' => ['nullable', 'string', 'max:20'],
            'default_ncm' => ['nullable', 'string', 'max:20'],
            'default_cfop' => ['nullable', 'string', 'max:10'],
            'default_commercial_unit' => ['nullable', 'string', 'max:10'],
            'default_tax_unit' => ['nullable', 'string', 'max:10'],
            'default_icms_origin' => ['nullable', 'string', 'max:5'],
            'default_icms_situation' => ['nullable', 'string', 'max:10'],
            'default_pis_situation' => ['nullable', 'string', 'max:10'],
            'default_cofins_situation' => ['nullable', 'string', 'max:10'],
        ]);

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

    public function issueOrder(Order $order): RedirectResponse
    {
        Gate::authorize('fiscal-documents.access');
        $this->authorize('update', $order);

        try {
            $document = $this->focusNfeService->issueOrderNfse($order);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'NFS-e enviada para processamento na Focus NFe. Referência: '.$document->provider_reference);
    }

    public function issueSale(Sale $sale): RedirectResponse
    {
        Gate::authorize('fiscal-documents.access');
        $this->authorize('update', $sale);

        try {
            $document = $this->focusNfeService->issueSaleNfe($sale);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'NF-e enviada para processamento na Focus NFe. Referência: '.$document->provider_reference);
    }

    private function settingPayload(FiscalSetting $setting): array
    {
        return [
            ...$setting->only([
                'id',
                'enabled',
                'provider',
                'environment',
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
            'has_api_token' => ! empty($setting->api_token),
            'has_webhook_secret' => ! empty($setting->webhook_secret),
        ];
    }
}
