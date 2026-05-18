<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminFiscalDocument;
use App\Models\Admin\AdminFiscalSetting;
use App\Models\Tenant;
use App\Services\AdminFocusNfeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FiscalDocumentController extends Controller
{
    public function __construct(private readonly AdminFocusNfeService $focusNfeService) {}

    public function index(): Response
    {
        $documents = AdminFiscalDocument::query()
            ->with(['tenant:id,company,name,cnpj,email', 'registeredBy:id,name'])
            ->latest()
            ->paginate(15);

        return Inertia::render('admin/fiscal-documents/index', [
            'documents' => $documents,
            'settingConfigured' => AdminFiscalSetting::query()->where('enabled', true)->exists(),
        ]);
    }

    public function settings(): Response
    {
        $setting = AdminFiscalSetting::query()->firstOrCreate([], [
            'provider' => 'focus_nfe',
            'environment' => 'sandbox',
            'default_service_description' => 'Assinatura SigmaOS - {{ plano }}',
        ]);

        return Inertia::render('admin/fiscal-documents/settings', [
            'fiscalSetting' => $this->settingPayload($setting),
        ]);
    }

    public function update(Request $request, AdminFiscalSetting $adminFiscalSetting): RedirectResponse
    {
        $request->merge([
            'environment' => $this->normalizeEnvironment($request->input('environment')),
            'default_iss_rate' => $this->normalizeNullableDecimal($request->input('default_iss_rate')),
        ]);

        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
            'environment' => ['required', 'in:sandbox,production'],
            'api_token' => ['nullable', 'string', 'max:4000'],
            'webhook_secret' => ['nullable', 'string', 'max:4000'],
            'legal_name' => ['nullable', 'string', 'max:255'],
            'trade_name' => ['nullable', 'string', 'max:255'],
            'cnpj' => ['nullable', 'string', 'max:50'],
            'municipal_registration' => ['nullable', 'string', 'max:50'],
            'service_city_code' => ['nullable', 'string', 'max:20'],
            'service_list_item' => ['nullable', 'string', 'max:30'],
            'default_iss_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'tax_regime' => ['nullable', 'string', 'max:50'],
            'zip_code' => ['nullable', 'string', 'max:50'],
            'state' => ['nullable', 'string', 'max:50'],
            'city' => ['nullable', 'string', 'max:80'],
            'district' => ['nullable', 'string', 'max:80'],
            'street' => ['nullable', 'string', 'max:120'],
            'number' => ['nullable', 'string', 'max:50'],
            'complement' => ['nullable', 'string', 'max:100'],
            'default_service_description' => ['nullable', 'string', 'max:500'],
        ]);

        $data['provider'] = 'focus_nfe';

        if (blank($data['api_token'] ?? null)) {
            unset($data['api_token']);
        }

        if (blank($data['webhook_secret'] ?? null)) {
            unset($data['webhook_secret']);
        }

        $adminFiscalSetting->update($data);

        return redirect()->route('admin.fiscal-documents.settings')->with('success', 'Configurações fiscais do SaaS salvas com sucesso.');
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

    public function issueTenant(Request $request, Tenant $tenant): RedirectResponse
    {
        $tenant->loadMissing('plan');

        $data = $request->validate([
            'amount' => ['nullable', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $document = $this->focusNfeService->issueTenantSubscriptionNfse(
                $tenant,
                isset($data['amount']) ? (float) $data['amount'] : null,
                $data['description'] ?? null
            );
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'NFS-e SaaS enviada para processamento. Referência: '.$document->provider_reference);
    }

    public function sync(AdminFiscalDocument $adminFiscalDocument): RedirectResponse
    {
        try {
            $document = $this->focusNfeService->refreshDocument($adminFiscalDocument);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Documento fiscal sincronizado com a Focus NFe. Status: '.$document->status);
    }

    private function settingPayload(AdminFiscalSetting $setting): array
    {
        return [
            ...$setting->only([
                'id',
                'enabled',
                'provider',
                'legal_name',
                'trade_name',
                'cnpj',
                'municipal_registration',
                'service_city_code',
                'service_list_item',
                'default_iss_rate',
                'tax_regime',
                'zip_code',
                'state',
                'city',
                'district',
                'street',
                'number',
                'complement',
                'default_service_description',
            ]),
            'environment' => $this->normalizeEnvironment($setting->environment),
            'has_api_token' => ! empty($setting->api_token),
            'has_webhook_secret' => ! empty($setting->webhook_secret),
        ];
    }
}
