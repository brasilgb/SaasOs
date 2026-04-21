import { toastSuccess, toastWarning } from '@/components/app-toast-messages';
import AppearanceTabs from '@/components/appearance-tabs';
import { Breadcrumbs } from '@/components/breadcrumbs';
import HeadingSmall from '@/components/heading-small';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        enablesales: othersettings?.enablesales ?? false,
        show_follow_ups_menu: othersettings?.show_follow_ups_menu ?? false,
        show_tasks_menu: othersettings?.show_tasks_menu ?? false,
        show_commercial_performance_menu: othersettings?.show_commercial_performance_menu ?? false,
        show_quality_menu: othersettings?.show_quality_menu ?? false,
        mail_mailer: mailSettings?.mail_mailer ?? 'smtp',
        mail_host: mailSettings?.mail_host ?? '',
        mail_port: mailSettings?.mail_port ?? 587,
        mail_username: mailSettings?.mail_username ?? '',
        mail_password: '',
        mail_encryption: mailSettings?.mail_encryption ?? 'tls',
        mail_from_address: mailSettings?.mail_from_address ?? '',
        mail_from_name: mailSettings?.mail_from_name ?? '',
        warranty_return_alert_threshold: businessMetrics?.warranty_return_alert_threshold ?? 10,
        communication_follow_up_cooldown_days: businessMetrics?.communication_follow_up_cooldown_days ?? 2,
        automatic_follow_ups_enabled: businessMetrics?.automatic_follow_ups_enabled ?? false,
        customer_feedback_request_delay_days: businessMetrics?.customer_feedback_request_delay_days ?? 7,
        budget_conversion_target: businessMetrics?.budget_conversion_target ?? 60,
        payment_recovery_target: businessMetrics?.payment_recovery_target ?? 70,
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
            <div className="flex min-h-16 w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Wrench} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Outras configurações</h2>
                </div>
                <div className="sm:ml-auto sm:text-right">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="w-full p-4">
                <div className="w-full rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
                    <div className="mb-8 space-y-6">
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

                    <form onSubmit={handleSubmit} autoComplete="off" className="mt-8 w-full space-y-8">
                        <Tabs defaultValue="system" className="w-full space-y-6">
                            <TabsList className="grid w-full grid-cols-2 lg:w-fit lg:min-w-[420px]">
                                <TabsTrigger value="system">Sistema e SMTP</TabsTrigger>
                                <TabsTrigger value="operational">Operacionais</TabsTrigger>
                            </TabsList>

                            <TabsContent value="system" className="w-full space-y-8">
                                <div className="space-y-6 rounded-2xl border p-5">
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

                                <div className="space-y-6 rounded-2xl border p-5">
                                    <HeadingSmall
                                        title="Configuração de e-mail (SMTP)"
                                        description={`Cadastre os dados da conta de e-mail para envio de notificações de status e outros e-mails automáticos. O teste será enviado para ${company?.email || 'o e-mail cadastrado da empresa'}.`}
                                    />

                                    <div className="grid w-full gap-4 xl:grid-cols-2 2xl:grid-cols-4">
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
                                        <div className="space-y-2 xl:col-span-2">
                                            <Label htmlFor="mail_username">Usuário SMTP</Label>
                                            <Input
                                                id="mail_username"
                                                value={data.mail_username}
                                                disabled={!canManageOtherSettings}
                                                onChange={(e) => setData('mail_username', e.target.value)}
                                                placeholder="sending-mail@email.com.br"
                                            />
                                        </div>
                                        <div className="space-y-2 xl:col-span-2">
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
                                        <div className="space-y-2 xl:col-span-2">
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
                                        <div className="space-y-2 xl:col-span-2">
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
                            </TabsContent>

                            <TabsContent value="operational" className="w-full space-y-8">
                                <div className="space-y-6 rounded-2xl border p-5">
                                    <HeadingSmall
                                        title="Visibilidade dos menus operacionais"
                                        description="Escolha quais atalhos operacionais aparecem no menu lateral e no cabeçalho para os usuários com permissão."
                                    />

                                    <div className="grid w-full gap-4 xl:grid-cols-2">
                                        <div className="bg-card text-card-foreground flex items-center justify-between rounded-2xl border p-4 shadow-sm">
                                            <div>
                                                <p className="font-medium">Acompanhamentos</p>
                                                <p className="text-muted-foreground text-sm">Menu de follow-ups gerais.</p>
                                            </div>
                                            <Switch
                                                id="show_follow_ups_menu"
                                                checked={data.show_follow_ups_menu}
                                                disabled={!canManageOtherSettings}
                                                onCheckedChange={(checked) => setData('show_follow_ups_menu', checked)}
                                            />
                                        </div>

                                        <div className="bg-card text-card-foreground flex items-center justify-between rounded-2xl border p-4 shadow-sm">
                                            <div>
                                                <p className="font-medium">Tarefas</p>
                                                <p className="text-muted-foreground text-sm">Fila operacional de tarefas do time.</p>
                                            </div>
                                            <Switch
                                                id="show_tasks_menu"
                                                checked={data.show_tasks_menu}
                                                disabled={!canManageOtherSettings}
                                                onCheckedChange={(checked) => setData('show_tasks_menu', checked)}
                                            />
                                        </div>

                                        <div className="bg-card text-card-foreground flex items-center justify-between rounded-2xl border p-4 shadow-sm">
                                            <div>
                                                <p className="font-medium">Perf. comercial</p>
                                                <p className="text-muted-foreground text-sm">Indicadores de conversão e recuperação.</p>
                                            </div>
                                            <Switch
                                                id="show_commercial_performance_menu"
                                                checked={data.show_commercial_performance_menu}
                                                disabled={!canManageOtherSettings}
                                                onCheckedChange={(checked) => setData('show_commercial_performance_menu', checked)}
                                            />
                                        </div>

                                        <div className="bg-card text-card-foreground flex items-center justify-between rounded-2xl border p-4 shadow-sm">
                                            <div>
                                                <p className="font-medium">Garantia/Avaliações</p>
                                                <p className="text-muted-foreground text-sm">Área de garantia e feedbacks de clientes.</p>
                                            </div>
                                            <Switch
                                                id="show_quality_menu"
                                                checked={data.show_quality_menu}
                                                disabled={!canManageOtherSettings}
                                                onCheckedChange={(checked) => setData('show_quality_menu', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 rounded-2xl border p-5">
                                    <HeadingSmall
                                        title="Indicador de retorno em garantia"
                                        description="Defina o percentual máximo aceitável de retorno em garantia no período. Acima desse valor, o dashboard e os relatórios passam a exibir alerta visual."
                                    />

                                    <div className="grid w-full gap-4 xl:grid-cols-2">
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

                                <div className="space-y-6 rounded-2xl border p-5">
                                    <HeadingSmall
                                        title="Intervalo de follow-up com cliente"
                                        description="Define quantos dias o sistema espera para considerar orçamento parado ou cobrança pendente elegíveis para novo contato automático."
                                    />

                                    <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
                                        <div className="bg-card text-card-foreground flex items-center justify-between rounded-2xl border p-4 shadow-sm">
                                            <div>
                                                <p className="font-medium">Envio automático de follow-up</p>
                                                <p className="text-muted-foreground text-sm">
                                                    Quando desabilitado, o sistema não envia automaticamente e-mails de orçamento parado nem de cobrança pendente.
                                                </p>
                                            </div>
                                            <Switch
                                                id="automatic_follow_ups_enabled"
                                                checked={data.automatic_follow_ups_enabled}
                                                disabled={!canManageOtherSettings}
                                                onCheckedChange={(checked) => setData('automatic_follow_ups_enabled', checked)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="communication_follow_up_cooldown_days">Dias entre contatos</Label>
                                            <Input
                                                id="communication_follow_up_cooldown_days"
                                                type="number"
                                                min="1"
                                                max="30"
                                                step="1"
                                                value={data.communication_follow_up_cooldown_days}
                                                disabled={!canManageOtherSettings || !data.automatic_follow_ups_enabled}
                                                onChange={(e) =>
                                                    setData(
                                                        'communication_follow_up_cooldown_days',
                                                        e.target.value === '' ? '' : Number(e.target.value),
                                                    )
                                                }
                                                placeholder="2"
                                            />
                                            <p className="text-muted-foreground text-xs leading-relaxed">
                                                Esse valor é usado na listagem de ordens e nas automações de orçamento parado e cobrança pendente.
                                                Se o envio automático estiver desligado, este intervalo fica apenas configurado para uso futuro.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 rounded-2xl border p-5">
                                    <HeadingSmall
                                        title="Prazo para solicitar avaliação do cliente"
                                        description="Define quantos dias após a entrega o sistema passa a sinalizar que a ordem deve receber avaliação do cliente na área pública."
                                    />

                                    <div className="grid w-full gap-4 xl:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_feedback_request_delay_days">Dias após a entrega</Label>
                                            <Input
                                                id="customer_feedback_request_delay_days"
                                                type="number"
                                                min="1"
                                                max="30"
                                                step="1"
                                                value={data.customer_feedback_request_delay_days}
                                                disabled={!canManageOtherSettings}
                                                onChange={(e) =>
                                                    setData(
                                                        'customer_feedback_request_delay_days',
                                                        e.target.value === '' ? '' : Number(e.target.value),
                                                    )
                                                }
                                                placeholder="7"
                                            />
                                            <p className="text-muted-foreground text-xs leading-relaxed">
                                                Após esse prazo, a ordem continuará como aguardando avaliação até que o cliente responda pelo painel público.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 rounded-2xl border p-5">
                                    <HeadingSmall
                                        title="Metas de performance comercial"
                                        description="Defina as metas mínimas esperadas para conversão de orçamento e recuperação de cobrança. A página de performance comercial passa a sinalizar quando a taxa atual ficar abaixo da meta."
                                    />

                                    <div className="grid w-full gap-4 xl:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="budget_conversion_target">Meta de conversão de orçamento (%)</Label>
                                            <Input
                                                id="budget_conversion_target"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={data.budget_conversion_target}
                                                disabled={!canManageOtherSettings}
                                                onChange={(e) =>
                                                    setData(
                                                        'budget_conversion_target',
                                                        e.target.value === '' ? '' : Number(e.target.value),
                                                    )
                                                }
                                                placeholder="60"
                                            />
                                            <p className="text-muted-foreground text-xs leading-relaxed">
                                                Referência sugerida: abaixo de 50% atenção, acima de 60% saudável para a maioria das operações.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="payment_recovery_target">Meta de recuperação de cobrança (%)</Label>
                                            <Input
                                                id="payment_recovery_target"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={data.payment_recovery_target}
                                                disabled={!canManageOtherSettings}
                                                onChange={(e) =>
                                                    setData(
                                                        'payment_recovery_target',
                                                        e.target.value === '' ? '' : Number(e.target.value),
                                                    )
                                                }
                                                placeholder="70"
                                            />
                                            <p className="text-muted-foreground text-xs leading-relaxed">
                                                Referência sugerida: abaixo de 60% atenção, acima de 70% saudável para cobrança recorrente.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                        <div className="flex flex-col justify-end gap-2 pt-2 sm:flex-row">
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
            </div>
        </AppLayout>
    );
}
