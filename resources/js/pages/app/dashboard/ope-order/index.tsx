import { ChartAreaDashboard } from '@/components/Charts/chart-area-dashboard';
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
import { Link, usePage } from '@inertiajs/react';
import { Calendar, Check, MemoryStickIcon, MessageSquareMore, Users, Wrench } from 'lucide-react';
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

export default function OrderDashboard({ timerange, dateRange, customRange, parts, customers, others, cashier, orders, acount, listSchedules }: any) {
    const { auth } = usePage<{ auth?: { role?: string; permissions?: string[] } }>().props;
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

    const rangeLabel =
        customRange && dateRange?.from && dateRange?.to ? `${formatBrDate(dateRange.from)} a ${formatBrDate(dateRange.to)}` : `${timerange} dias`;

    return (
        <div className="min-w-0">
            <div className="grid gap-3 rounded-xl sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <KpiDashboard
                    link={route('app.customers.index')}
                    title="Clientes"
                    value={acount?.numcust}
                    icon={<Users className="h-10 w-10" />}
                    description={`Período ${rangeLabel}`}
                    valuedays={metrics?.customers ? metrics?.customers : '0'}
                />
                <KpiDashboard
                    link={route('app.orders.index')}
                    title="Ordens"
                    value={acount?.numorde}
                    icon={<Wrench className="h-10 w-10" />}
                    description={`Período ${rangeLabel}`}
                    valuedays={metrics?.orders ? metrics?.orders : '0'}
                />
                <KpiDashboard
                    link={route('app.schedules.index')}
                    title="Agendamentos"
                    value={acount?.numshed}
                    icon={<Calendar className="h-10 w-10" />}
                    description={`Período ${rangeLabel}`}
                    valuedays={metrics?.schedules ? metrics?.schedules : '0'}
                />
                <KpiDashboard
                    link={route('app.messages.index')}
                    title="Mensagens"
                    value={acount?.nummess}
                    icon={<MessageSquareMore className="h-10 w-10" />}
                    description={`Período ${rangeLabel}`}
                    valuedays={metrics?.messages ? metrics?.messages : '0'}
                />
                <KpiDashboard
                    link={route('app.parts.index')}
                    title="Peças"
                    value={acount?.numparts}
                    icon={<MemoryStickIcon className="h-10 w-10" />}
                    description={`Período ${rangeLabel}`}
                    valuedays={metrics?.parts ? metrics?.parts : '0'}
                />

                <KpiDashboard
                    link={route('app.parts.index')}
                    title="Produtos"
                    value={acount?.numproducts}
                    icon={<MemoryStickIcon className="h-10 w-10" />}
                    description={`Período ${rangeLabel}`}
                    valuedays={metrics?.products ? metrics?.products : '0'}
                />
            </div>
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
                                    </TabsList>
                                    <TabsContent value="va" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Visitas agendadas pelo número do agendamento</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.agendados.map((age: any) => (
                                                <Button key={age.id} variant={'secondary'} asChild>
                                                    <Link href={route('app.schedules.index', { q: age.id, init: true })}>{age.schedules_number}</Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="og" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Orçamentos gerados por número de ordem</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.gerados.map((ger: any) => (
                                                <Button key={ger.id} variant={'secondary'} asChild>
                                                    <Link href={route('app.orders.index', { q: ger.id, init: true })}>{ger.order_number}</Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="oa" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Orçamentos aprovados por número de ordem</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.aprovados.map((apro: any) => (
                                                <Button key={apro.id} variant={'secondary'} asChild>
                                                    <Link href={route('app.orders.index', { q: apro.id, init: true })}>{apro.order_number}</Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="ca" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Serviços concluídos por número de ordem e clientes avisados</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.concluidosca.map((conca: any) => (
                                                <Button key={conca.id} variant={'secondary'} asChild>
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
                                            {orders?.concluidoscn.map((concn: any) => (
                                                <Button key={concn.id} variant={'secondary'} asChild>
                                                    <Link href={route('app.orders.index', { q: concn.id, init: true })}>{concn.order_number}</Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="fb" className="max-h-48 overflow-y-auto">
                                        <div className="py-1 text-xs font-semibold">Serviços a sete dias para provável feedback</div>
                                        <div className="flex flex-wrap gap-2 border-t py-2">
                                            {orders?.feedback.map((ger: any) => (
                                                <Button key={ger.id} variant={'secondary'} asChild>
                                                    <Link href={route('app.orders.index', { q: ger.id, init: true, fd: 1 })} className="relative">
                                                        {ger.feedback && <Check className="absolute -top-1 -right-1 h-4 w-4" />}
                                                        {ger.order_number}
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

            <div className="mt-3">
                <div>
                    <ChartAreaDashboard timerange={timerange} dateRange={dateRange} customRange={customRange} />
                </div>
                <div className="mt-3">
                    <ChartFluxoOrders timerange={timerange} dateRange={dateRange} customRange={customRange} />
                </div>
            </div>
        </div>
    );
}
