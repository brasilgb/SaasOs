<?php

namespace Tests\Feature\Admin;

use App\Models\Admin\AdminFiscalDocument;
use App\Models\Admin\AdminFiscalSetting;
use App\Models\Admin\Plan;
use App\Models\Tenant;
use App\Models\User;
use App\Services\AdminFocusNfeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdminFocusNfeServiceTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'tenant_id' => null,
            'user_number' => null,
            'roles' => User::ROLE_ROOT_APP,
        ]);

        $this->actingAs($this->admin);

        AdminFiscalSetting::create([
            'enabled' => true,
            'provider' => 'focus_nfe',
            'environment' => 'sandbox',
            'api_token' => 'admin-focus-token',
            'legal_name' => 'SigmaOS Tecnologia Ltda',
            'trade_name' => 'SigmaOS',
            'cnpj' => '11222333000181',
            'municipal_registration' => '12345678',
            'service_city_code' => '3550308',
            'service_list_item' => '01.05',
            'default_iss_rate' => 2.0,
            'default_service_description' => 'Assinatura SigmaOS - {{ plano }} para {{ empresa }}',
        ]);
    }

    public function test_it_issues_saas_subscription_nfse_for_tenant(): void
    {
        Http::fake([
            'api.focusnfe.com.br/v2/nfse*' => Http::response([
                'status' => 'processando',
                'numero_nfse' => '20260001',
                'codigo_verificacao' => 'SAAS123',
                'url' => 'https://focus.test/saas-nfse.pdf',
                'url_xml' => 'https://focus.test/saas-nfse.xml',
            ], 200),
        ]);

        $plan = Plan::factory()->create([
            'name' => 'Mensal',
            'value' => 149.90,
        ]);
        $tenant = Tenant::factory()->create([
            'plan_id' => $plan->id,
            'company' => 'Cliente SaaS Ltda',
            'name' => 'Cliente SaaS',
            'cnpj' => '99888777000166',
            'email' => 'financeiro@cliente.test',
            'zip_code' => '01001000',
            'state' => 'SP',
            'city' => 'Sao Paulo',
            'district' => 'Centro',
            'street' => 'Rua Cliente',
            'number' => '200',
        ]);

        $document = app(AdminFocusNfeService::class)->issueTenantSubscriptionNfse($tenant);

        expect($document->type)->toBe('nfse')
            ->and($document->provider)->toBe('focus_nfe')
            ->and($document->provider_reference)->toBe("saas-nfse-{$tenant->id}-{$document->id}")
            ->and($document->status)->toBe('processando')
            ->and($document->number)->toBe('20260001')
            ->and($document->access_key)->toBe('SAAS123')
            ->and($document->pdf_url)->toBe('https://focus.test/saas-nfse.pdf')
            ->and($document->xml_url)->toBe('https://focus.test/saas-nfse.xml');

        $this->assertDatabaseHas('admin_fiscal_documents', [
            'tenant_id' => $tenant->id,
            'type' => 'nfse',
            'provider' => 'focus_nfe',
            'status' => 'processando',
            'number' => '20260001',
            'amount' => 149.90,
            'registered_by' => $this->admin->id,
        ]);

        Http::assertSent(function (Request $request) use ($document) {
            $payload = $request->data();

            return $request->method() === 'POST'
                && str_contains((string) $request->url(), "/v2/nfse?ref={$document->provider_reference}")
                && $request->hasHeader('Authorization', 'Basic '.base64_encode('admin-focus-token:'))
                && $payload['prestador']['cnpj'] === '11222333000181'
                && $payload['prestador']['inscricao_municipal'] === '12345678'
                && $payload['prestador']['codigo_municipio'] === '3550308'
                && $payload['tomador']['cnpj'] === '99888777000166'
                && $payload['tomador']['razao_social'] === 'Cliente SaaS Ltda'
                && $payload['servico']['item_lista_servico'] === '01.05'
                && $payload['servico']['valor_servicos'] === 149.90
                && $payload['servico']['discriminacao'] === 'Assinatura SigmaOS - Mensal para Cliente SaaS Ltda';
        });
    }

    public function test_it_refreshes_admin_nfse_status_by_reference(): void
    {
        Http::fake([
            'api.focusnfe.com.br/v2/nfse/saas-nfse-*' => Http::response([
                'status' => 'autorizado',
                'numero_nfse' => '20260002',
                'codigo_verificacao' => 'SYNC123',
                'url' => 'https://focus.test/saas-sync.pdf',
                'url_xml' => 'https://focus.test/saas-sync.xml',
            ], 200),
        ]);

        $tenant = Tenant::factory()->create();
        $document = AdminFiscalDocument::create([
            'tenant_id' => $tenant->id,
            'type' => 'nfse',
            'provider' => 'focus_nfe',
            'environment' => 'sandbox',
            'provider_reference' => "saas-nfse-{$tenant->id}-10",
            'status' => 'processing',
            'amount' => 100,
            'registered_by' => $this->admin->id,
        ]);

        $refreshed = app(AdminFocusNfeService::class)->refreshDocument($document);

        expect($refreshed->status)->toBe('autorizado')
            ->and($refreshed->number)->toBe('20260002')
            ->and($refreshed->access_key)->toBe('SYNC123')
            ->and($refreshed->pdf_url)->toBe('https://focus.test/saas-sync.pdf')
            ->and($refreshed->xml_url)->toBe('https://focus.test/saas-sync.xml');

        Http::assertSent(function (Request $request) use ($document) {
            return $request->method() === 'GET'
                && str_contains((string) $request->url(), "/v2/nfse/{$document->provider_reference}")
                && $request->hasHeader('Authorization', 'Basic '.base64_encode('admin-focus-token:'));
        });
    }
}
