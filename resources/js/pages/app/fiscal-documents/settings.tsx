import { toastSuccess } from '@/components/app-toast-messages';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { HelpCircle, ReceiptText, Save } from 'lucide-react';
import type { FormEvent } from 'react';

type FiscalSetting = {
    id: number;
    enabled: boolean;
    provider: string;
    environment: 'sandbox' | 'production';
    nfe_enabled: boolean;
    nfse_enabled: boolean;
    company_tax_regime?: string | null;
    state_registration?: string | null;
    municipal_registration?: string | null;
    service_city_code?: string | null;
    service_list_item?: string | null;
    default_iss_rate?: string | number | null;
    default_nfe_series?: string | null;
    default_nfse_series?: string | null;
    default_ncm?: string | null;
    default_cfop?: string | null;
    default_commercial_unit?: string | null;
    default_tax_unit?: string | null;
    default_icms_origin?: string | null;
    default_icms_situation?: string | null;
    default_pis_situation?: string | null;
    default_cofins_situation?: string | null;
    has_api_token: boolean;
    has_webhook_secret: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Configurações fiscais',
        href: '#',
    },
];

function FieldLabel({ htmlFor, children, help }: { htmlFor: string; children: string; help: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <Label htmlFor={htmlFor}>{children}</Label>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground focus:ring-ring inline-flex rounded-sm focus:ring-2 focus:outline-none"
                    >
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span className="sr-only">Ajuda sobre {children}</span>
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-72 leading-snug">
                    {help}
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

export default function FiscalDocumentSettings({ fiscalSetting }: { fiscalSetting: FiscalSetting }) {
    const { data, setData, put, processing, errors } = useForm({
        enabled: fiscalSetting.enabled,
        environment: fiscalSetting.environment ?? 'sandbox',
        api_token: '',
        webhook_secret: '',
        nfe_enabled: fiscalSetting.nfe_enabled,
        nfse_enabled: fiscalSetting.nfse_enabled,
        company_tax_regime: fiscalSetting.company_tax_regime ?? '',
        state_registration: fiscalSetting.state_registration ?? '',
        municipal_registration: fiscalSetting.municipal_registration ?? '',
        service_city_code: fiscalSetting.service_city_code ?? '',
        service_list_item: fiscalSetting.service_list_item ?? '',
        default_iss_rate: fiscalSetting.default_iss_rate ?? '',
        default_nfe_series: fiscalSetting.default_nfe_series ?? '',
        default_nfse_series: fiscalSetting.default_nfse_series ?? '',
        default_ncm: fiscalSetting.default_ncm ?? '',
        default_cfop: fiscalSetting.default_cfop ?? '',
        default_commercial_unit: fiscalSetting.default_commercial_unit ?? 'UN',
        default_tax_unit: fiscalSetting.default_tax_unit ?? 'UN',
        default_icms_origin: fiscalSetting.default_icms_origin ?? '0',
        default_icms_situation: fiscalSetting.default_icms_situation ?? '102',
        default_pis_situation: fiscalSetting.default_pis_situation ?? '99',
        default_cofins_situation: fiscalSetting.default_cofins_situation ?? '99',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        put(route('app.fiscal-documents.settings.update', fiscalSetting.id), {
            preserveScroll: true,
            onSuccess: () => toastSuccess('Sucesso', 'Configurações fiscais salvas com sucesso.'),
        });
    };

    return (
        <AppLayout>
            <Head title="Configurações fiscais" />

            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={ReceiptText} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Configurações fiscais</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-4">
                <Card>
                    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>Integração Focus NFe</CardTitle>
                            <CardDescription>
                                Ative a emissão fiscal por tenant usando as credenciais contratadas diretamente com a Focus NFe.
                            </CardDescription>
                        </div>
                        <Badge variant={data.enabled ? 'default' : 'secondary'}>{data.enabled ? 'Ativo' : 'Inativo'}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <FieldLabel
                                    htmlFor="enabled"
                                    help="Liga a integração fiscal do tenant. Quando desligado, OS e vendas continuam permitindo apenas registro manual do comprovante fiscal."
                                >
                                    Ativar documentos fiscais
                                </FieldLabel>
                                <p className="text-muted-foreground text-sm">
                                    Quando desativado, vendas e ordens continuam usando o registro manual atual.
                                </p>
                            </div>
                            <Switch id="enabled" checked={data.enabled} onCheckedChange={(checked) => setData('enabled', checked)} />
                        </div>
                        <InputError message={errors.enabled} />
                    </CardContent>
                </Card>

                {data.enabled && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Ambiente e credenciais</CardTitle>
                                <CardDescription>Os tokens ficam criptografados no banco e não são exibidos novamente após salvar.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="environment"
                                        help="Define se as chamadas para a Focus NFe serão feitas em homologação para testes ou em produção para emissão fiscal válida."
                                    >
                                        Ambiente
                                    </FieldLabel>
                                    <select
                                        id="environment"
                                        className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                        value={data.environment}
                                        onChange={(e) => setData('environment', e.target.value as 'sandbox' | 'production')}
                                    >
                                        <option value="sandbox">Homologação</option>
                                        <option value="production">Produção</option>
                                    </select>
                                    <InputError message={errors.environment} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="api_token"
                                        help="Credencial usada para autenticar as chamadas na API da Focus NFe. O token fica criptografado e não é exibido novamente após salvar."
                                    >
                                        Token Focus NFe
                                    </FieldLabel>
                                    <Input
                                        id="api_token"
                                        type="password"
                                        value={data.api_token}
                                        placeholder={fiscalSetting.has_api_token ? 'Token já cadastrado' : 'Informe o token da Focus NFe'}
                                        onChange={(e) => setData('api_token', e.target.value)}
                                    />
                                    <InputError message={errors.api_token} />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <FieldLabel
                                        htmlFor="webhook_secret"
                                        help="Segredo usado para validar notificações enviadas pela Focus NFe ao SigmaOS. Não é necessário para a sincronização manual por consulta."
                                    >
                                        Segredo de webhook
                                    </FieldLabel>
                                    <Input
                                        id="webhook_secret"
                                        type="password"
                                        value={data.webhook_secret}
                                        placeholder={fiscalSetting.has_webhook_secret ? 'Segredo já cadastrado' : 'Opcional'}
                                        onChange={(e) => setData('webhook_secret', e.target.value)}
                                    />
                                    <InputError message={errors.webhook_secret} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tipos de emissão</CardTitle>
                                <CardDescription>Habilite os documentos que este tenant poderá emitir.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center justify-between rounded-md border p-3">
                                    <div>
                                        <FieldLabel
                                            htmlFor="nfe_enabled"
                                            help="Habilita emissão de NF-e pela Focus NFe para vendas de peças e produtos. Usa os campos fiscais de produto, como NCM, CFOP, ICMS, PIS e COFINS."
                                        >
                                            NF-e de produtos
                                        </FieldLabel>
                                        <p className="text-muted-foreground text-sm">Usada nas vendas de peças/produtos.</p>
                                    </div>
                                    <Switch
                                        id="nfe_enabled"
                                        checked={data.nfe_enabled}
                                        onCheckedChange={(checked) => setData('nfe_enabled', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-md border p-3">
                                    <div>
                                        <FieldLabel
                                            htmlFor="nfse_enabled"
                                            help="Habilita emissão de NFS-e pela Focus NFe para ordens de serviço. Usa dados municipais e de serviço, como inscrição municipal, município, item da lista e ISS."
                                        >
                                            NFS-e de serviços
                                        </FieldLabel>
                                        <p className="text-muted-foreground text-sm">Usada nas ordens de serviço.</p>
                                    </div>
                                    <Switch
                                        id="nfse_enabled"
                                        checked={data.nfse_enabled}
                                        onCheckedChange={(checked) => setData('nfse_enabled', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Dados fiscais padrão</CardTitle>
                                <CardDescription>Esses dados serão usados como base na montagem dos payloads da Focus NFe.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="company_tax_regime"
                                        help="Usado principalmente na NF-e para informar o regime tributário do emitente no payload enviado à Focus. Confirme o código com a contabilidade."
                                    >
                                        Regime tributário
                                    </FieldLabel>
                                    <Input
                                        id="company_tax_regime"
                                        value={data.company_tax_regime}
                                        onChange={(e) => setData('company_tax_regime', e.target.value)}
                                    />
                                    <InputError message={errors.company_tax_regime} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="state_registration"
                                        help="Usada na NF-e de produtos como inscrição estadual do emitente. Pode ser obrigatória conforme UF, regime e operação."
                                    >
                                        Inscrição estadual
                                    </FieldLabel>
                                    <Input
                                        id="state_registration"
                                        value={data.state_registration}
                                        onChange={(e) => setData('state_registration', e.target.value)}
                                    />
                                    <InputError message={errors.state_registration} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="municipal_registration"
                                        help="Usada na NFS-e de serviços como inscrição municipal do prestador perante a prefeitura."
                                    >
                                        Inscrição municipal
                                    </FieldLabel>
                                    <Input
                                        id="municipal_registration"
                                        value={data.municipal_registration}
                                        onChange={(e) => setData('municipal_registration', e.target.value)}
                                    />
                                    <InputError message={errors.municipal_registration} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="service_city_code"
                                        help="Usado na NFS-e para identificar o município de prestação/emissão do serviço. Normalmente é o código IBGE da cidade."
                                    >
                                        Código do município
                                    </FieldLabel>
                                    <Input
                                        id="service_city_code"
                                        value={data.service_city_code}
                                        onChange={(e) => setData('service_city_code', e.target.value)}
                                    />
                                    <InputError message={errors.service_city_code} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="service_list_item"
                                        help="Usado na NFS-e para classificar o serviço prestado, por exemplo 14.01 para manutenção/conserto. Deve ser validado com a prefeitura ou contador."
                                    >
                                        Item da lista de serviço
                                    </FieldLabel>
                                    <Input
                                        id="service_list_item"
                                        value={data.service_list_item}
                                        onChange={(e) => setData('service_list_item', e.target.value)}
                                    />
                                    <InputError message={errors.service_list_item} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="default_iss_rate"
                                        help="Usada na NFS-e para calcular/informar a alíquota padrão de ISS dos serviços emitidos."
                                    >
                                        Alíquota ISS padrão (%)
                                    </FieldLabel>
                                    <Input
                                        id="default_iss_rate"
                                        value={data.default_iss_rate}
                                        onChange={(e) => setData('default_iss_rate', e.target.value)}
                                    />
                                    <InputError message={errors.default_iss_rate} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="default_nfe_series"
                                        help="Série padrão da NF-e de produtos, quando a empresa utiliza controle de série. Pode ficar vazio se a Focus/emitente já definir isso."
                                    >
                                        Série NF-e
                                    </FieldLabel>
                                    <Input
                                        id="default_nfe_series"
                                        value={data.default_nfe_series}
                                        onChange={(e) => setData('default_nfe_series', e.target.value)}
                                    />
                                    <InputError message={errors.default_nfe_series} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="default_nfse_series"
                                        help="Série padrão da NFS-e de serviços, quando exigida pelo município ou pela configuração da Focus."
                                    >
                                        Série NFS-e
                                    </FieldLabel>
                                    <Input
                                        id="default_nfse_series"
                                        value={data.default_nfse_series}
                                        onChange={(e) => setData('default_nfse_series', e.target.value)}
                                    />
                                    <InputError message={errors.default_nfse_series} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="default_ncm"
                                        help="Usado na NF-e de produtos para classificar mercadorias. É obrigatório no fluxo atual de NF-e e deve corresponder ao tipo de produto vendido."
                                    >
                                        NCM padrão
                                    </FieldLabel>
                                    <Input id="default_ncm" value={data.default_ncm} onChange={(e) => setData('default_ncm', e.target.value)} />
                                    <InputError message={errors.default_ncm} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="default_cfop"
                                        help="Usado na NF-e de produtos para indicar a natureza fiscal da operação, como venda dentro do estado. Confirme o código correto com a contabilidade."
                                    >
                                        CFOP padrão
                                    </FieldLabel>
                                    <Input id="default_cfop" value={data.default_cfop} onChange={(e) => setData('default_cfop', e.target.value)} />
                                    <InputError message={errors.default_cfop} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="default_commercial_unit"
                                        help="Usada na NF-e como unidade em que o produto é vendido ao cliente. Exemplo comum: UN."
                                    >
                                        Unidade comercial
                                    </FieldLabel>
                                    <Input
                                        id="default_commercial_unit"
                                        value={data.default_commercial_unit}
                                        onChange={(e) => setData('default_commercial_unit', e.target.value)}
                                    />
                                    <InputError message={errors.default_commercial_unit} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="default_tax_unit"
                                        help="Usada na NF-e como unidade considerada para tributação. Em operações simples costuma ser igual à unidade comercial, como UN."
                                    >
                                        Unidade tributável
                                    </FieldLabel>
                                    <Input
                                        id="default_tax_unit"
                                        value={data.default_tax_unit}
                                        onChange={(e) => setData('default_tax_unit', e.target.value)}
                                    />
                                    <InputError message={errors.default_tax_unit} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="default_icms_origin"
                                        help="Usada na NF-e para indicar a origem da mercadoria no ICMS. Exemplo: 0 para nacional."
                                    >
                                        Origem ICMS
                                    </FieldLabel>
                                    <Input
                                        id="default_icms_origin"
                                        value={data.default_icms_origin}
                                        onChange={(e) => setData('default_icms_origin', e.target.value)}
                                    />
                                    <InputError message={errors.default_icms_origin} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="default_icms_situation"
                                        help="Usada na NF-e para informar a situação tributária do ICMS. O padrão 102 costuma ser usado em Simples Nacional, mas deve ser confirmado."
                                    >
                                        Situação ICMS
                                    </FieldLabel>
                                    <Input
                                        id="default_icms_situation"
                                        value={data.default_icms_situation}
                                        onChange={(e) => setData('default_icms_situation', e.target.value)}
                                    />
                                    <InputError message={errors.default_icms_situation} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="default_pis_situation"
                                        help="Usada na NF-e para informar a situação tributária do PIS nos itens de produto."
                                    >
                                        Situação PIS
                                    </FieldLabel>
                                    <Input
                                        id="default_pis_situation"
                                        value={data.default_pis_situation}
                                        onChange={(e) => setData('default_pis_situation', e.target.value)}
                                    />
                                    <InputError message={errors.default_pis_situation} />
                                </div>

                                <div className="grid gap-2">
                                    <FieldLabel
                                        htmlFor="default_cofins_situation"
                                        help="Usada na NF-e para informar a situação tributária do COFINS nos itens de produto."
                                    >
                                        Situação COFINS
                                    </FieldLabel>
                                    <Input
                                        id="default_cofins_situation"
                                        value={data.default_cofins_situation}
                                        onChange={(e) => setData('default_cofins_situation', e.target.value)}
                                    />
                                    <InputError message={errors.default_cofins_situation} />
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                        <Save className="h-4 w-4" />
                        Salvar
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
