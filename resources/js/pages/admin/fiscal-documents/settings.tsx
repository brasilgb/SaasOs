import { toastSuccess, toastWarning } from '@/components/app-toast-messages';
import { Icon } from '@/components/icon';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin/admin-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ReceiptText, Save } from 'lucide-react';
import type { FormEvent } from 'react';

type FiscalSetting = {
    id: number;
    enabled: boolean;
    provider: string;
    environment: 'sandbox' | 'production';
    legal_name?: string | null;
    trade_name?: string | null;
    cnpj?: string | null;
    municipal_registration?: string | null;
    service_city_code?: string | null;
    service_list_item?: string | null;
    default_iss_rate?: string | number | null;
    tax_regime?: string | null;
    zip_code?: string | null;
    state?: string | null;
    city?: string | null;
    district?: string | null;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    default_service_description?: string | null;
    has_api_token: boolean;
    has_webhook_secret: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Notas SaaS',
        href: route('admin.fiscal-documents.index'),
    },
    {
        title: 'Configurações',
        href: '#',
    },
];

export default function AdminFiscalDocumentSettings({ fiscalSetting }: { fiscalSetting: FiscalSetting }) {
    const { data, setData, put, processing, errors } = useForm({
        enabled: fiscalSetting.enabled,
        environment: fiscalSetting.environment ?? 'sandbox',
        api_token: '',
        webhook_secret: '',
        legal_name: fiscalSetting.legal_name ?? '',
        trade_name: fiscalSetting.trade_name ?? '',
        cnpj: fiscalSetting.cnpj ?? '',
        municipal_registration: fiscalSetting.municipal_registration ?? '',
        service_city_code: fiscalSetting.service_city_code ?? '',
        service_list_item: fiscalSetting.service_list_item ?? '',
        default_iss_rate: fiscalSetting.default_iss_rate ?? '',
        tax_regime: fiscalSetting.tax_regime ?? '',
        zip_code: fiscalSetting.zip_code ?? '',
        state: fiscalSetting.state ?? '',
        city: fiscalSetting.city ?? '',
        district: fiscalSetting.district ?? '',
        street: fiscalSetting.street ?? '',
        number: fiscalSetting.number ?? '',
        complement: fiscalSetting.complement ?? '',
        default_service_description: fiscalSetting.default_service_description ?? 'Assinatura SigmaOS - {{ plano }}',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        put(route('admin.fiscal-documents.settings.update', fiscalSetting.id), {
            preserveScroll: true,
            onSuccess: () => toastSuccess('Sucesso', 'Configurações fiscais do SaaS salvas com sucesso.'),
            onError: (formErrors) => {
                toastWarning('Erro', Object.values(formErrors)[0] ?? 'Não foi possível salvar as configurações fiscais do SaaS.');
            },
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurações fiscais SaaS" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={ReceiptText} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Configurações fiscais SaaS</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-4">
                <Card>
                    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>Integração Focus NFe do SaaS</CardTitle>
                            <CardDescription>
                                Use esta configuração para emitir NFS-e da plataforma para as empresas clientes.
                            </CardDescription>
                        </div>
                        <Badge variant={data.enabled ? 'default' : 'secondary'}>{data.enabled ? 'Ativo' : 'Inativo'}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <Label htmlFor="enabled">Ativar emissão fiscal SaaS</Label>
                                <p className="text-muted-foreground text-sm">Quando desativado, o admin não emite NFS-e para empresas clientes.</p>
                            </div>
                            <Switch id="enabled" checked={data.enabled} onCheckedChange={(checked) => setData('enabled', checked)} />
                        </div>
                        <InputError message={errors.enabled} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ambiente e credenciais</CardTitle>
                        <CardDescription>Os tokens ficam criptografados no banco e não são exibidos novamente após salvar.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="environment">Ambiente</Label>
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
                            <Label htmlFor="api_token">Token Focus NFe</Label>
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
                            <Label htmlFor="webhook_secret">Segredo de webhook</Label>
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
                        <CardTitle>Emitente</CardTitle>
                        <CardDescription>Dados fiscais da empresa dona do SigmaOS.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="grid gap-2 xl:col-span-2">
                            <Label htmlFor="legal_name">Razão social</Label>
                            <Input id="legal_name" value={data.legal_name} onChange={(e) => setData('legal_name', e.target.value)} />
                            <InputError message={errors.legal_name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="trade_name">Nome fantasia</Label>
                            <Input id="trade_name" value={data.trade_name} onChange={(e) => setData('trade_name', e.target.value)} />
                            <InputError message={errors.trade_name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input id="cnpj" value={data.cnpj} onChange={(e) => setData('cnpj', e.target.value)} />
                            <InputError message={errors.cnpj} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="municipal_registration">Inscrição municipal</Label>
                            <Input
                                id="municipal_registration"
                                value={data.municipal_registration}
                                onChange={(e) => setData('municipal_registration', e.target.value)}
                            />
                            <InputError message={errors.municipal_registration} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tax_regime">Regime tributário</Label>
                            <Input id="tax_regime" value={data.tax_regime} onChange={(e) => setData('tax_regime', e.target.value)} />
                            <InputError message={errors.tax_regime} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Serviço padrão</CardTitle>
                        <CardDescription>Dados usados no payload de NFS-e da assinatura SaaS.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="grid gap-2">
                            <Label htmlFor="service_city_code">Código município</Label>
                            <Input
                                id="service_city_code"
                                value={data.service_city_code}
                                onChange={(e) => setData('service_city_code', e.target.value)}
                            />
                            <InputError message={errors.service_city_code} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="service_list_item">Item lista serviço</Label>
                            <Input
                                id="service_list_item"
                                value={data.service_list_item}
                                onChange={(e) => setData('service_list_item', e.target.value)}
                            />
                            <InputError message={errors.service_list_item} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="default_iss_rate">Alíquota ISS</Label>
                            <Input
                                id="default_iss_rate"
                                value={data.default_iss_rate}
                                onChange={(e) => setData('default_iss_rate', e.target.value)}
                            />
                            <InputError message={errors.default_iss_rate} />
                        </div>
                        <div className="grid gap-2 md:col-span-2 xl:col-span-4">
                            <Label htmlFor="default_service_description">Descrição padrão</Label>
                            <Textarea
                                id="default_service_description"
                                value={data.default_service_description}
                                onChange={(e) => setData('default_service_description', e.target.value)}
                            />
                            <p className="text-muted-foreground text-xs">Use {'{{ empresa }}'} e {'{{ plano }}'} para preencher automaticamente.</p>
                            <InputError message={errors.default_service_description} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Endereço do emitente</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="grid gap-2">
                            <Label htmlFor="zip_code">CEP</Label>
                            <Input id="zip_code" value={data.zip_code} onChange={(e) => setData('zip_code', e.target.value)} />
                            <InputError message={errors.zip_code} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="state">UF</Label>
                            <Input id="state" value={data.state} onChange={(e) => setData('state', e.target.value)} />
                            <InputError message={errors.state} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Input id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                            <InputError message={errors.city} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="district">Bairro</Label>
                            <Input id="district" value={data.district} onChange={(e) => setData('district', e.target.value)} />
                            <InputError message={errors.district} />
                        </div>
                        <div className="grid gap-2 xl:col-span-2">
                            <Label htmlFor="street">Endereço</Label>
                            <Input id="street" value={data.street} onChange={(e) => setData('street', e.target.value)} />
                            <InputError message={errors.street} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="number">Número</Label>
                            <Input id="number" value={data.number} onChange={(e) => setData('number', e.target.value)} />
                            <InputError message={errors.number} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="complement">Complemento</Label>
                            <Input id="complement" value={data.complement} onChange={(e) => setData('complement', e.target.value)} />
                            <InputError message={errors.complement} />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                        <Save className="h-4 w-4" />
                        Salvar
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
