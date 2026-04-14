import { ChartAreaDashboard } from '@/components/Charts/chart-area-dashboard';
import ChartBudgetsStatus from '@/components/Charts/chart-budgets-status';
import ChartFluxoOrders from '@/components/Charts/chart-fluxo-orders';
import { KpiDashboard } from '@/components/kpi-dashboard';
import { KpiOverdueOrders } from '@/components/kpi-overdue-orders';
import { SalesProducts } from '@/components/sales-products';
import ScheduleCalendarModal from '@/components/Schedules/ScheduleCalendarModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { connectBackend } from '@/Utils/connectApi';
import { Link } from '@inertiajs/react';
import { Calendar, Check, MemoryStickIcon, MessageSquareMore, ShieldAlert, Users, Wrench } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';

function formatIsoDate(date: Date | string) {
    const d = date instanceof Date ? date : new Date(date);
    return moment(d).format('YYYY-MM-DD');
}

function formatBrDate(date: Date | string) {
    const d = date instanceof Date ? date : new Date(date);
    return moment(d).format('DD/MM/YYYY');
}


export default function OrderDashboard({
    timerange,
    dateRange,
    customRange,
    parts,
    customers,
    others,
    cashier,
    orders,
    acount,
    listSchedules,
    auth,
}: any) {
    const [metrics, setMetrics] = useState<any>([]);
    const canUsePdv = auth?.permissions?.includes('sales') && auth?.role !== 'technician';
    const isCashierOpen = Boolean(cashier?.isOpen);

    useEffect(() => {
        const getOrders = async () => {
            try {
                const query = new URLSearchParams();

                if (customRange && dateRange?.from && dateRange?.to) {
                    query.set('from', formatIsoDate(dateRange.from));
                    query.set('to', formatIsoDate(dateRange.to));
                }

                const url = `metricsSystem/${timerange}${query.toString() ? `?${query.toString()}` : ''}`;
                const response = await connectBackend.get(url);
                setMetrics(response.data);
            } catch (error) {
                console.error('Erro ao carregar dados do gráfico Fluxo de ordens', error);
            }
        };
        getOrders();
    }, [timerange, customRange, dateRange]);

    // Lógica consolidada para o Label do período
    const isTodayRange = Number(timerange) === 1;
    const rangeLabel =
        customRange && dateRange?.from && dateRange?.to
            ? `${formatBrDate(dateRange.from)} a ${formatBrDate(dateRange.to)}`
            : isTodayRange
                ? 'Hoje'
                : `${timerange} dias`;

    const periodDescription = `Período ${rangeLabel}`;
    const warrantyRate = Number(metrics?.warranty_return_rate ?? 0);
    const warrantyThreshold = Number(metrics?.warranty_return_threshold ?? 0);
    const warrantyAlert = Boolean(metrics?.warranty_return_alert);
    const warrantySeverity =
        warrantyRate <= 5 ? 'Saudável' : warrantyRate <= warrantyThreshold ? 'Atenção' : 'Crítico';
    const warrantyDescription =
        metrics?.orders > 0
            ? `${warrantySeverity} | taxa ${warrantyRate}% | limite ${warrantyThreshold}%`
            : `${periodDescription} | sem ordens no período`;

    return (
        <div className="min-w-0">
            <div className="grid gap-3 rounded-xl sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
                <KpiDashboard
                    link={route('app.customers.index')}
                    title="Clientes"
                    value={metrics?.customers ?? 0}
                    icon={<Users className="h-10 w-10" />}
                    description={periodDescription}
                />
                <KpiDashboard
                    link={route('app.orders.index')}
                    title="Ordens"
                    value={metrics?.orders ?? 0}
                    icon={<Wrench className="h-10 w-10" />}
                    description={periodDescription}
                />
                <KpiDashboard
                    link={route('app.orders.index', { filter: 'warranty_return' })}
                    title="Retorno garantia"
                    value={metrics?.warranty_returns ?? 0}
                    icon={<ShieldAlert className="h-10 w-10" />}
                    description={warrantyDescription}
                />
                <KpiDashboard
                    link={route('app.schedules.index')}
                    title="Agendamentos"
                    value={metrics?.schedules ?? 0}
                    icon={<Calendar className="h-10 w-10" />}
                    description={periodDescription}
                />
                <KpiDashboard
                    link={route('app.messages.index')}
                    title="Mensagens"
                    value={metrics?.messages ?? 0}
                    icon={<MessageSquareMore className="h-10 w-10" />}
                    description={periodDescription}
                />
                <KpiDashboard
                    link={route('app.parts.index')}
                    title="Peças"
                    value={metrics?.parts ?? 0}
                    icon={<MemoryStickIcon className="h-10 w-10" />}
                    description={periodDescription}
                />

                <KpiDashboard
                    link={route('app.parts.index')}
                    title="Produtos"
                    value={metrics?.products ?? 0}
                    icon={<MemoryStickIcon className="h-10 w-10" />}
                    description={periodDescription}
                />
            </div>
            {warrantyAlert && (
                <Card className="mt-3 border-amber-300 bg-amber-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-amber-900">
                            Alerta de qualidade: taxa de retorno em garantia acima do limite
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-amber-900">
                        O período atual está com {warrantyRate}% de retorno em garantia, acima do limite configurado de {warrantyThreshold}%.
                        Revise os relatórios por técnico, equipamento e defeito para identificar a origem.
                    </CardContent>
                </Card>
            )}
            {!warrantyAlert && metrics?.orders > 0 && warrantyRate > 5 && (
                <Card className="mt-3 border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-blue-900">
                            Atenção: retorno em garantia merece acompanhamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-blue-900">
                        O período atual está com {warrantyRate}% de retorno em garantia. Ainda está dentro do limite configurado de{' '}
                        {warrantyThreshold}%, mas já saiu da faixa saudável sugerida de até 5%.
                    </CardContent>
                </Card>
            )}
            <div className="mt-3 grid min-h-[210px] gap-3 2xl:grid-cols-7">
                <div className="h-full min-w-0">
                    {others?.enablesales && canUsePdv ? (
                        <div className="flex h-full flex-col gap-3">
                            <Card className="flex h-full flex-col items-center justify-center gap-3 p-4">
                                <div className="w-full rounded-lg border p-3 text-center">
                                    <div className="text-sm font-medium">Caixa diário</div>
                                    <div className={`text-xs ${isCashierOpen ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {isCashierOpen ? 'Aberto' : 'Fechado'}
                                    </div>
                                    {!isCashierOpen && (
                                        <Button variant="outline" size="sm" className="mt-2" asChild>
                                            <Link href={route('app.cashier.index')}>Abrir caixa diário</Link>
                                        </Button>
                                    )}
                                </div>
                                <SalesProducts parts={parts} customers={customers} iconSize={60} />
                            </Card>
                            <Card className="flex h-full items-center justify-center p-4">
                                <ScheduleCalendarModal schedules={listSchedules} iconSize={60} variant="outline" />
                            </Card>
                        </div>
                    ) : (
                        <Card className="flex h-full items-center justify-center p-4">
                            <ScheduleCalendarModal schedules={listSchedules} iconSize={80} variant="outline" />
                        </Card>
                    )}
                </div>
                <KpiOverdueOrders
                    link={route('app.orders.index', { filter: 'due_48h' })}
                    icon={<Wrench className="h-10 w-10" />}
                    title="Ordens Vencendo"
                    ordersToday={acount?.numorde_due_today}
                    ordersTomorrow={acount?.numorde_due_tomorrow}
                />
                <div className="h-full min-w-0 2xl:col-span-5">
                    <Card className="@container/card h-full flex-1">
                        <CardHeader>
                            <CardTitle>Status das Operações</CardTitle>
                        </CardHeader>
                        <CardContent className="px-2">
                            <Tabs defaultValue="va">
                                <div className="w-full overflow-x-auto">
                                    <TabsList className="w-max min-w-full flex-nowrap">
                                        <TabsTrigger className="px-2 whitespace-nowrap" value="va">
                                            Agendamentos
                                            <Badge className="ml-1 text-xs">{orders?.agendados.length}</Badge>
                                        </TabsTrigger>

                                        <TabsTrigger className="px-2 whitespace-nowrap" value="og">
                                            Orçam. gerados
                                            <Badge className="ml-1 text-xs">{orders?.gerados.length}</Badge>
                                        </TabsTrigger>

                                        <TabsTrigger className="px-2 whitespace-nowrap" value="oa">
                                            Orçam. aprovados
                                            <Badge className="ml-1 text-xs">{orders?.aprovados.length}</Badge>
                                        </TabsTrigger>

                                        <TabsTrigger className="px-2 whitespace-nowrap" value="ca">
                                            Serv. concluído aguardando retirada
                                            <Badge className="ml-1 text-xs">{orders?.concluidosca.length}</Badge>
                                        </TabsTrigger>

                                        <TabsTrigger className="px-2 whitespace-nowrap" value="cn">
                                            Serv. concluído
                                            <Badge className="ml-1 text-xs">{orders?.concluidoscn.length}</Badge>
                                        </TabsTrigger>

                                        <TabsTrigger className="px-2 whitespace-nowrap" value="fb">
                                            Equip. Entregue há 7 dias
                                            <Badge className="ml-1 text-xs">{orders?.feedback.length}</Badge>
                                        </TabsTrigger>

                                        <TabsTrigger className="px-2 whitespace-nowrap" value="wg">
                                            Retorno garantia
                                            <Badge className="ml-1 text-xs">{orders?.garantia.length}</Badge>
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="va" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Visitas agendadas pelo número do agendamento</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.agendados.map((age: any, index: number) => (
                                                <Button key={`ag-${age.schedules_number ?? index}`} variant={'secondary'} asChild>
                                                    <Link href={route('app.schedules.index', { q: age.id, init: true })}>{age.schedules_number}</Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="og" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Orçamentos gerados por número de ordem</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.gerados.map((ger: any, index: number) => (
                                                <Button key={`og-${ger.order_number ?? index}`} variant={'secondary'} asChild>
                                                    <Link href={route('app.orders.index', { q: ger.id, init: true })}>{ger.order_number}</Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="oa" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Orçamentos aprovados por número de ordem</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.aprovados.map((apro: any, index: number) => (
                                                <Button key={`oa-${apro.order_number ?? index}`} variant={'secondary'} asChild>
                                                    <Link href={route('app.orders.index', { q: apro.id, init: true })}>{apro.order_number}</Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="ca" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Serviços concluídos por número de ordem e clientes avisados</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.concluidosca.map((conca: any, index: number) => (
                                                <Button key={`ca-${conca.order_number ?? index}`} variant={'secondary'} asChild>
                                                    <Link href={route('app.orders.index', { q: conca.id, init: true })}>{conca.order_number}</Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="cn" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">
                                            Serviços concluídos por número de ordem e clientes não avisados
                                        </div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.concluidoscn.map((concn: any, index: number) => (
                                                <Button key={`cn-${concn.order_number ?? index}`} variant={'secondary'} asChild>
                                                    <Link href={route('app.orders.index', { q: concn.id, init: true })}>{concn.order_number}</Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="fb" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Serviços a sete dias para provável feedback</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.feedback.map((ger: any, index: number) => (
                                                <Button key={`fb-${ger.order_number ?? index}`} variant={'secondary'} asChild>
                                                    <Link href={route('app.orders.index', { q: ger.id, init: true, fd: 1 })} className="relative">
                                                        {ger.feedback && <Check className="absolute -top-1 -right-1 h-4 w-4" />}
                                                        {ger.order_number}
                                                    </Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="wg" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Ordens identificadas como retorno em garantia</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.garantia.map((ret: any, index: number) => (
                                                <Button key={`wg-${ret.order_number ?? index}`} variant={'secondary'} asChild>
                                                    <Link
                                                        href={route('app.orders.index', {
                                                            filter: 'warranty_return',
                                                            search: ret.order_number,
                                                        })}
                                                    >
                                                        {ret.order_number}
                                                    </Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-3">
                <div>
                    <ChartAreaDashboard timerange={timerange} dateRange={dateRange} customRange={customRange} />
                </div>
                <div>
                    <ChartBudgetsStatus timerange={timerange} dateRange={dateRange} customRange={customRange} />
                </div>
                <div>
                    <ChartFluxoOrders timerange={timerange} dateRange={dateRange} customRange={customRange} />
                </div>
            </div>
        </div>
    );
}
