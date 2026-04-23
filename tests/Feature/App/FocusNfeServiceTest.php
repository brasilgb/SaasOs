<?php

namespace Tests\Feature\App;

use App\Models\App\Company;
use App\Models\App\Customer;
use App\Models\App\FiscalSetting;
use App\Models\App\Order;
use App\Models\App\Part;
use App\Models\App\Sale;
use App\Models\App\SaleItem;
use App\Models\Tenant;
use App\Models\User;
use App\Services\FocusNfeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class FocusNfeServiceTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create(['name' => 'Empresa teste']);
        $this->user = User::factory()->forTenant($this->tenant->id)->create();

        $this->withSession(['tenant_id' => $this->tenant->id])
            ->actingAs($this->user);

        Company::factory()->forTenant($this->tenant->id)->create([
            'companyname' => 'Assistencia Teste Ltda',
            'shortname' => 'Assistencia Teste',
            'cnpj' => '11222333000181',
            'zip_code' => '01001000',
            'state' => 'SP',
            'city' => 'Sao Paulo',
            'district' => 'Centro',
            'street' => 'Rua Fiscal',
            'number' => '100',
        ]);

        FiscalSetting::create([
            'tenant_id' => $this->tenant->id,
            'enabled' => true,
            'provider' => 'focus_nfe',
            'environment' => 'sandbox',
            'api_token' => 'focus-token-teste',
            'nfe_enabled' => true,
            'nfse_enabled' => true,
            'company_tax_regime' => '1',
            'state_registration' => '110042490114',
            'municipal_registration' => '12345678',
            'service_city_code' => '3550308',
            'service_list_item' => '14.01',
            'default_iss_rate' => 2.5,
            'default_ncm' => '85177010',
            'default_cfop' => '5102',
            'default_commercial_unit' => 'UN',
            'default_tax_unit' => 'UN',
            'default_icms_origin' => '0',
            'default_icms_situation' => '102',
            'default_pis_situation' => '99',
            'default_cofins_situation' => '99',
        ]);
    }

    public function test_it_issues_product_nfe_with_mocked_focus_response(): void
    {
        Http::fake([
            'api.focusnfe.com.br/v2/nfe*' => Http::response([
                'status' => 'autorizado',
                'numero' => '12345',
                'serie' => '1',
                'chave_nfe' => '35260411222333000181550010000123451000012345',
                'caminho_danfe' => 'https://focus.test/danfe.pdf',
                'caminho_xml_nota_fiscal' => 'https://focus.test/nfe.xml',
            ], 200),
        ]);

        $customer = Customer::factory()->forTenant($this->tenant->id)->create([
            'name' => 'Cliente Produto',
            'cpfcnpj' => '12345678909',
            'zipcode' => '01001000',
            'state' => 'SP',
            'city' => 'Sao Paulo',
            'district' => 'Centro',
            'street' => 'Rua Cliente',
            'number' => '200',
        ]);
        $part = Part::factory()->forTenant($this->tenant->id)->create([
            'part_number' => 'TELA-001',
            'name' => 'Tela OLED',
        ]);
        $sale = Sale::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'total_amount' => 300,
            'paid_amount' => 300,
            'status' => 'completed',
            'financial_status' => 'paid',
        ]);
        SaleItem::create([
            'sale_id' => $sale->id,
            'part_id' => $part->id,
            'quantity' => 2,
            'unit_price' => 150,
        ]);

        $document = app(FocusNfeService::class)->issueSaleNfe($sale);

        expect($document->type)->toBe('nfe')
            ->and($document->provider)->toBe('focus_nfe')
            ->and($document->provider_reference)->toBe("nfe-{$this->tenant->id}-{$sale->id}")
            ->and($document->status)->toBe('autorizado')
            ->and($document->number)->toBe('12345')
            ->and($document->access_key)->toBe('35260411222333000181550010000123451000012345')
            ->and($document->pdf_url)->toBe('https://focus.test/danfe.pdf')
            ->and($document->xml_url)->toBe('https://focus.test/nfe.xml');

        $this->assertDatabaseHas('fiscal_documents', [
            'tenant_id' => $this->tenant->id,
            'documentable_type' => Sale::class,
            'documentable_id' => $sale->id,
            'type' => 'nfe',
            'provider' => 'focus_nfe',
            'status' => 'autorizado',
            'number' => '12345',
            'registered_by' => $this->user->id,
        ]);

        Http::assertSent(function (Request $request) use ($sale) {
            $payload = $request->data();

            return $request->method() === 'POST'
                && str_contains((string) $request->url(), "/v2/nfe?ref=nfe-{$this->tenant->id}-{$sale->id}")
                && $request->hasHeader('Authorization', 'Basic '.base64_encode('focus-token-teste:'))
                && $payload['natureza_operacao'] === 'Venda'
                && $payload['valor_produtos'] === 300.0
                && $payload['valor_total'] === 300.0
                && $payload['cnpj_emitente'] === '11222333000181'
                && $payload['cpf_destinatario'] === '12345678909'
                && $payload['items'][0]['codigo_produto'] === 'TELA-001'
                && $payload['items'][0]['descricao'] === 'Tela OLED'
                && $payload['items'][0]['codigo_ncm'] === '85177010'
                && $payload['items'][0]['cfop'] === '5102'
                && $payload['items'][0]['valor_bruto'] === 300.0;
        });
    }

    public function test_it_issues_service_nfse_with_mocked_focus_response(): void
    {
        Http::fake([
            'api.focusnfe.com.br/v2/nfse*' => Http::response([
                'status' => 'processando',
                'numero_nfse' => '789',
                'codigo_verificacao' => 'ABC123',
                'url' => 'https://focus.test/nfse.pdf',
                'url_xml' => 'https://focus.test/nfse.xml',
            ], 200),
        ]);

        $customer = Customer::factory()->forTenant($this->tenant->id)->create([
            'name' => 'Cliente Servico',
            'cpfcnpj' => '98765432100',
            'email' => 'cliente.servico@example.com',
            'zipcode' => '01001000',
            'state' => 'SP',
            'city' => 'Sao Paulo',
            'district' => 'Centro',
            'street' => 'Rua Tomador',
            'number' => '300',
        ]);
        $order = Order::factory()->forTenant($this->tenant->id)->create([
            'customer_id' => $customer->id,
            'order_number' => 77,
            'service_value' => 450,
            'service_cost' => 450,
            'services_performed' => 'Troca de conector e limpeza tecnica',
        ]);

        $document = app(FocusNfeService::class)->issueOrderNfse($order);

        expect($document->type)->toBe('nfse')
            ->and($document->provider)->toBe('focus_nfe')
            ->and($document->provider_reference)->toBe("nfse-{$this->tenant->id}-{$order->id}")
            ->and($document->status)->toBe('processando')
            ->and($document->number)->toBe('789')
            ->and($document->access_key)->toBe('ABC123')
            ->and($document->pdf_url)->toBe('https://focus.test/nfse.pdf')
            ->and($document->xml_url)->toBe('https://focus.test/nfse.xml');

        $this->assertDatabaseHas('fiscal_documents', [
            'tenant_id' => $this->tenant->id,
            'documentable_type' => Order::class,
            'documentable_id' => $order->id,
            'type' => 'nfse',
            'provider' => 'focus_nfe',
            'status' => 'processando',
            'number' => '789',
            'registered_by' => $this->user->id,
        ]);

        Http::assertSent(function (Request $request) use ($order) {
            $payload = $request->data();

            return $request->method() === 'POST'
                && str_contains((string) $request->url(), "/v2/nfse?ref=nfse-{$this->tenant->id}-{$order->id}")
                && $request->hasHeader('Authorization', 'Basic '.base64_encode('focus-token-teste:'))
                && $payload['prestador']['cnpj'] === '11222333000181'
                && $payload['prestador']['inscricao_municipal'] === '12345678'
                && $payload['prestador']['codigo_municipio'] === '3550308'
                && $payload['tomador']['cpf'] === '98765432100'
                && $payload['tomador']['razao_social'] === 'Cliente Servico'
                && $payload['servico']['aliquota'] === 2.5
                && $payload['servico']['item_lista_servico'] === '14.01'
                && $payload['servico']['valor_servicos'] === 450.0
                && $payload['servico']['discriminacao'] === 'Troca de conector e limpeza tecnica';
        });
    }
}
