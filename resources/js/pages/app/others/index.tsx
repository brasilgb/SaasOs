import { toastSuccess, toastWarning } from '@/components/app-toast-messages';
import AppearanceTabs from '@/components/appearance-tabs';
import { Breadcrumbs } from '@/components/breadcrumbs';
import HeadingSmall from '@/components/heading-small';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskCpfCnpj } from '@/Utils/mask';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Save, Wrench } from 'lucide-react';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Outras configurações',
        href: '#',
    },
];

export default function Others({ othersettings, company, time_remaining, mailSettings, businessMetrics }: any) {
    const { auth, flash } = usePage().props as any;
    const canManageOtherSettings = auth?.permissions?.includes('other_settings');

    const { data, setData, put, processing } = useForm({
        navigation: othersettings?.navigation,
        budget: othersettings?.budget,
        enableparts: othersettings?.enableparts,
        enablesales: othersettings?.enablesales,
        mail_mailer: mailSettings?.mail_mailer ?? 'smtp',
        mail_host: mailSettings?.mail_host ?? '',
        mail_port: mailSettings?.mail_port ?? 587,
        mail_username: mailSettings?.mail_username ?? '',
        mail_password: '',
        mail_encryption: mailSettings?.mail_encryption ?? 'tls',
        mail_from_address: mailSettings?.mail_from_address ?? '',
        mail_from_name: mailSettings?.mail_from_name ?? '',
        warranty_return_alert_threshold: businessMetrics?.warranty_return_alert_threshold ?? 10,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        put(route('app.other-settings.update', othersettings?.id), {
            onSuccess: () => {
                toastSuccess('Sucesso', 'Configuração ajustada com sucesso');
            },
        });
    };

    const handleSendTestMail = () => {
        router.post(
            route('app.other-settings.test-mail', othersettings?.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    useEffect(() => {
        if (flash?.message) {
            toastSuccess('Sucesso', flash.message);
        }

        if (flash?.error) {
            toastWarning('Erro', flash.error);
        }
    }, [flash?.message, flash?.error]);

    return (
        <AppLayout>
            <Head title="Outras configurações" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Wrench} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Outras configurações</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="p-4">
                <div className="mb-6 space-y-6">
                    <HeadingSmall
                        title="Licença de uso do sistema"
                        description={`Este software é licenciado para a empresa ${company?.companyname}, CNPJ: ${maskCpfCnpj(company?.cnpj)}. Localizada na ${company?.street}, ${company?.number}, ${company?.district}, ${company?.city} - ${company?.state}.`}
                        license={auth.user.tenant.plan.name}
                        time_remaining={time_remaining}
                    />
                </div>

                <div className="space-y-6">
                    <HeadingSmall title="Configurações de aparência" description="Altere a aparencia do sistema entre temas claro ou escuro." />
                    <AppearanceTabs />
                </div>
                {/* <div className="space-y-6 mt-6">
                    <HeadingSmall title="Dados para área do cliente do site" description="Insere os dados do cliente e de suas ordens de serviço a área do cliente no site da empresa." />

                    {uploading && <AlertSuccess message={uploading} className='!p-0' />}
                </div> */}
                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
                    <div className="mt-6 space-y-6">
                        <HeadingSmall
                            title="Habilitar vendas, despesas e operações de caixa"
                            description="Ao habilitar, libera os módulos de Vendas, Despesas e Caixa Diário para administradores e operadores. Ao desabilitar, esses módulos ficam ocultos e bloqueados."
                        />
                        <div className="flex items-center gap-3">
                            <Switch
                                id="status"
                                checked={data.enablesales}
                                disabled={!canManageOtherSettings}
                                onCheckedChange={(checked) => setData('enablesales', checked)}
                            />

                            <span className="text-muted-foreground text-sm">{data.enablesales ? 'Habilitado' : 'Desabilitado'}</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-6">
                        <HeadingSmall
                            title="Indicador de retorno em garantia"
                            description="Defina o percentual máximo aceitável de retorno em garantia no período. Acima desse valor, o dashboard e os relatórios passam a exibir alerta visual."
                        />

                        <div className="grid gap-4 md:max-w-sm">
                            <div className="space-y-2">
                                <Label htmlFor="warranty_return_alert_threshold">Limite de alerta (%)</Label>
                                <Input
                                    id="warranty_return_alert_threshold"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={data.warranty_return_alert_threshold}
                                    disabled={!canManageOtherSettings}
                                    onChange={(e) =>
                                        setData(
                                            'warranty_return_alert_threshold',
                                            e.target.value === '' ? '' : Number(e.target.value),
                                        )
                                    }
                                    placeholder="10"
                                />
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                    Referência sugerida: até 5% saudável, entre 5% e 10% atenção, acima de 10% crítico.
                                    Ajuste conforme o perfil técnico e o tipo de equipamento da operação.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-6">
                        <HeadingSmall
                            title="Configuração de e-mail (SMTP)"
                            description={`Cadastre os dados da conta de e-mail para envio de notificações de status e outros e-mails automáticos. O teste será enviado para ${company?.email || 'o e-mail cadastrado da empresa'}.`}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="mail_mailer">Mailer</Label>
                                <Input
                                    id="mail_mailer"
                                    value={data.mail_mailer}
                                    disabled={!canManageOtherSettings}
                                    onChange={(e) => setData('mail_mailer', e.target.value)}
                                    placeholder="smtp"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mail_host">Host</Label>
                                <Input
                                    id="mail_host"
                                    value={data.mail_host}
                                    disabled={!canManageOtherSettings}
                                    onChange={(e) => setData('mail_host', e.target.value)}
                                    placeholder="smtp.server.email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mail_port">Porta</Label>
                                <Input
                                    id="mail_port"
                                    type="number"
                                    value={data.mail_port}
                                    disabled={!canManageOtherSettings}
                                    onChange={(e) => setData('mail_port', Number(e.target.value))}
                                    placeholder="465"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mail_encryption">Criptografia</Label>
                                <Input
                                    id="mail_encryption"
                                    value={data.mail_encryption}
                                    disabled={!canManageOtherSettings}
                                    onChange={(e) => setData('mail_encryption', e.target.value)}
                                    placeholder="ssl ou tls"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mail_username">Usuário SMTP</Label>
                                <Input
                                    id="mail_username"
                                    value={data.mail_username}
                                    disabled={!canManageOtherSettings}
                                    onChange={(e) => setData('mail_username', e.target.value)}
                                    placeholder="sending-mail@email.com.br"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mail_password">Senha SMTP</Label>
                                <Input
                                    id="mail_password"
                                    type="password"
                                    value={data.mail_password}
                                    disabled={!canManageOtherSettings}
                                    onChange={(e) => setData('mail_password', e.target.value)}
                                    placeholder={mailSettings?.mail_password_set ? '•••••••• (deixe em branco para manter)' : 'Digite a senha SMTP'}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mail_from_address">E-mail remetente</Label>
                                <Input
                                    id="mail_from_address"
                                    type="email"
                                    value={data.mail_from_address}
                                    disabled={!canManageOtherSettings}
                                    onChange={(e) => setData('mail_from_address', e.target.value)}
                                    placeholder="sending-mail@email.com.br"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mail_from_name">Nome remetente</Label>
                                <Input
                                    id="mail_from_name"
                                    value={data.mail_from_name}
                                    disabled={!canManageOtherSettings}
                                    onChange={(e) => setData('mail_from_name', e.target.value)}
                                    placeholder="Nome da empresa"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleSendTestMail} disabled={!canManageOtherSettings}>
                            Testar envio SMTP
                        </Button>
                        <Button type="submit" disabled={processing || !canManageOtherSettings}>
                            <Save />
                            Salvar
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
