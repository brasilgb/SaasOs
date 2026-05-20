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
import { Calendar, Check, MemoryStickIcon, MessageSquareMore, ShieldAlert, Star, Users, Wrench } from 'lucide-react';
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
    feedbackDelay,
    acount,
    listSchedules,
    auth,
}: any) {
    const [metrics, setMetrics] = useState<any>([]);
    const canUsePdv = auth?.permissions?.includes('sales') && auth?.role !== 'technician';
    const canUseFinance = auth?.permissions?.includes('finance') && auth?.role !== 'technician';
    const isCashierOpen = Boolean(cashier?.isOpen);
    const showFinanceShortcut = Boolean(others?.enable_finance && canUseFinance);
    const showPdvShortcut = Boolean(others?.enablesales && canUsePdv);

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

    const defaultKpiDescription = 'Acessar dados';
    const periodKpiDescription = (value: number) => (
        <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate">Total período</span>
            <span className="bg-primary/10 text-primary rounded-md px-1.5 py-0.5 font-semibold tabular-nums">{value}</span>
        </span>
    );
    const feedbackDelayLabel = `${Number(feedbackDelay || 7)} ${Number(feedbackDelay || 7) === 1 ? 'dia' : 'dias'}`;
    const operationLinkClass =
        'inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-slate-200 px-4 py-2 text-sm font-medium whitespace-nowrap text-slate-900 shadow-xs transition-all hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-50 dark:hover:bg-slate-600';
    const warrantyLinkClass =
        'inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-amber-100 px-4 py-2 text-sm font-medium whitespace-nowrap text-amber-900 shadow-xs transition-all hover:bg-amber-200 dark:bg-amber-500/25 dark:text-amber-100 dark:hover:bg-amber-500/35';

    return (
        <div className="min-w-0">
            <div className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <KpiDashboard
                        link={route('app.customers.index')}
                        title="Clientes"
                        value={acount?.numcust ?? 0}
                        icon={<Users className="h-10 w-10" />}
                        description={periodKpiDescription(metrics?.customers ?? 0)}
                    />
                    <KpiDashboard
                        link={route('app.orders.index')}
                        title="Ordens"
                        value={acount?.numorde ?? 0}
                        icon={<Wrench className="h-10 w-10" />}
                        description={periodKpiDescription(metrics?.orders ?? 0)}
                    />
                    <KpiDashboard
                        link={route('app.schedules.index')}
                        title="Agenda"
                        value={acount?.numshed ?? 0}
                        icon={<Calendar className="h-10 w-10" />}
                        description={periodKpiDescription(metrics?.schedules ?? 0)}
                    />
                    <KpiDashboard
                        link={route('app.messages.index')}
                        title="Mensagens"
                        value={acount?.nummess ?? 0}
                        icon={<MessageSquareMore className="h-10 w-10" />}
                        description={periodKpiDescription(metrics?.messages ?? 0)}
                    />
                    <KpiDashboard
                        link={route('app.orders.index', { filter: 'budget_follow_up' })}
                        title="Orç. parados"
                        value={metrics?.budget_follow_ups ?? 0}
                        icon={<MessageSquareMore className="h-10 w-10" />}
                        description="Cobrar retorno"
                    />
                    <KpiDashboard
                        link={route('app.orders.index', { filter: 'pending_payment_follow_up' })}
                        title="Cobranças"
                        value={metrics?.pending_payment_follow_ups ?? 0}
                        icon={<MessageSquareMore className="h-10 w-10" />}
                        description="Cobrar saldo"
                    />
                    <KpiDashboard
                        link={route('app.orders.index', { filter: 'warranty_return' })}
                        title="Retorno garantia"
                        value={metrics?.warranty_returns ?? 0}
                        icon={<ShieldAlert className="h-10 w-10" />}
                        description={defaultKpiDescription}
                    />
                    <KpiDashboard
                        link={route('app.quality.index')}
                        title="Avaliação"
                        value={metrics?.feedback_average_rating ?? 0}
                        icon={<Star className="h-10 w-10" />}
                        description={`${metrics?.feedback_responses ?? 0} resposta(s) • ${metrics?.feedback_response_rate ?? 0}% retorno`}
                    />
                    <KpiDashboard
                        link={route('app.parts.index')}
                        title="Peças"
                        value={acount?.numparts ?? 0}
                        icon={<MemoryStickIcon className="h-10 w-10" />}
                        description={periodKpiDescription(metrics?.parts ?? 0)}
                    />
                    <KpiDashboard
                        link={route('app.parts.index')}
                        title="Produtos"
                        value={acount?.numproducts ?? 0}
                        icon={<MemoryStickIcon className="h-10 w-10" />}
                        description={periodKpiDescription(metrics?.products ?? 0)}
                    />
                </div>
            </div>
            <div className="mt-3 grid min-h-[210px] gap-3 2xl:grid-cols-7">
                <div className="h-full min-w-0">
                    {showFinanceShortcut || showPdvShortcut ? (
                        <div className="flex h-full flex-col gap-3">
                            <Card className="flex h-full flex-col items-center justify-center gap-3 p-4">
                                {showFinanceShortcut && (
                                    <div className="w-full rounded-lg border p-3 text-center">
                                        <div className="text-sm font-medium">Caixa</div>
                                        <div className={`text-xs ${isCashierOpen ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {isCashierOpen ? 'Aberto' : 'Fechado'}
                                        </div>
                                        {!isCashierOpen && (
                                            <Button variant="outline" size="sm" className="mt-2" asChild>
                                                <Link href={route('app.cashier.index')}>Abrir caixa</Link>
                                            </Button>
                                        )}
                                    </div>
                                )}
                                {showPdvShortcut && <SalesProducts parts={parts} customers={customers} iconSize={60} />}
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
                                            Agenda
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
                                            Equip. entregue há {feedbackDelayLabel}
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
                                                <Link
                                                    key={`ag-${age.schedules_number ?? index}`}
                                                    href={route('app.schedules.index', { search: age.schedules_number, init: true })}
                                                    className={operationLinkClass}
                                                >
                                                    {age.schedules_number}
                                                </Link>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="og" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Orçamentos gerados por número de ordem</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.gerados.map((ger: any, index: number) => (
                                                <Link
                                                    key={`og-${ger.order_number ?? index}`}
                                                    href={route('app.orders.index', { search: ger.order_number, init: true })}
                                                    className={operationLinkClass}
                                                >
                                                    {ger.order_number}
                                                </Link>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="oa" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Orçamentos aprovados por número de ordem</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.aprovados.map((apro: any, index: number) => (
                                                <Link
                                                    key={`oa-${apro.order_number ?? index}`}
                                                    href={route('app.orders.index', { search: apro.order_number, init: true })}
                                                    className={operationLinkClass}
                                                >
                                                    {apro.order_number}
                                                </Link>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="ca" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Serviços concluídos por número de ordem e clientes avisados</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.concluidosca.map((conca: any, index: number) => (
                                                <Link
                                                    key={`ca-${conca.order_number ?? index}`}
                                                    href={route('app.orders.index', { search: conca.order_number, init: true })}
                                                    className={operationLinkClass}
                                                >
                                                    {conca.order_number}
                                                </Link>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="cn" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">
                                            Serviços concluídos por número de ordem e clientes não avisados
                                        </div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.concluidoscn.map((concn: any, index: number) => (
                                                <Link
                                                    key={`cn-${concn.order_number ?? index}`}
                                                    href={route('app.orders.index', { search: concn.order_number, init: true })}
                                                    className={operationLinkClass}
                                                >
                                                    {concn.order_number}
                                                </Link>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="fb" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">
                                            Serviços no prazo de {feedbackDelayLabel} para provável feedback
                                        </div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.feedback.map((ger: any, index: number) => (
                                                <Link
                                                    key={`fb-${ger.order_number ?? index}`}
                                                    href={route('app.orders.index', { search: ger.order_number, init: true, fd: 1 })}
                                                    className={`${operationLinkClass} relative`}
                                                >
                                                    {ger.feedback && <Check className="absolute -top-1 -right-1 h-4 w-4" />}
                                                    {ger.order_number}
                                                </Link>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="wg" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Ordens identificadas como retorno em garantia</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.garantia.map((ret: any, index: number) => (
                                                <Link
                                                    key={`wg-${ret.order_number ?? index}`}
                                                    href={route('app.orders.index', {
                                                        filter: 'warranty_return',
                                                        search: ret.order_number,
                                                    })}
                                                    className={warrantyLinkClass}
                                                >
                                                    {ret.order_number}
                                                </Link>
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
