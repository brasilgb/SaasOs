import { KpiDashboard } from '@/components/kpi-dashboard';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, Check, LayoutGrid, LayoutGridIcon, MemoryStickIcon, MessageSquareMore, User, Users, Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartAreaDashboard } from '@/components/Charts/chart-area-dashboard';
import { SalesProducts } from '@/components/sales-products';
import ChartFluxoOrders from '@/components/Charts/chart-fluxo-orders';
import { useEffect, useState } from 'react';
import { connectBackend } from '@/Utils/connectApi';

export default function OrderDashboard({ timerange, parts, customers, others, orders, acount }: any) {

    const [metrics, setMetrics] = useState<any>([])

    useEffect(() => {
        const getOrders = async () => {
            try {
                const response = await connectBackend.get(`metricsSystem/${timerange}`);
                setMetrics(response.data);
            } catch (error) {
                console.error("Erro ao carregar dados do gráfico Fluxo de ordens", error);
            }
        }
        getOrders();
    }, [timerange]);

    return (

        <div>
            <div className={`grid ${others?.enablesales ? 'md:grid-cols-6' : 'md:grid-cols-5'} gap-6 rounded-xl`}>
                <KpiDashboard link={route('app.customers.index')} title="Clientes" value={acount?.numcust} icon={<Users className='h-10 w-10' />} description={`Período ${timerange} dias`} valuedays={metrics?.customers} />
                <KpiDashboard link={route('app.orders.index')} title="Ordens" value={acount?.numorde} icon={<Wrench className='h-10 w-10' />} description={`Período ${timerange} dias`} valuedays={metrics?.orders} />
                <KpiDashboard link={route('app.schedules.index')} title="Agendamentos" value={acount?.numshed} icon={<Calendar className='h-10 w-10' />} description={`Período ${timerange} dias`} valuedays={metrics?.schedules} />
                <KpiDashboard link={route('app.messages.index')} title="Mensagens" value={acount?.nummess} icon={<MessageSquareMore className='h-10 w-10' />} description={`Período ${timerange} dias`} valuedays={metrics?.messages} />
                <KpiDashboard link={route('app.parts.index')} title="Peças" value={acount?.numparts} icon={<MemoryStickIcon className='h-10 w-10' />} description={`Período ${timerange} dias`} valuedays={metrics?.parts} />

                {others?.enablesales ?
                    <Card className='flex items-center justify-center'>
                        <CardDescription>
                            Venda de Peças/Produtos
                        </CardDescription>
                        <SalesProducts parts={parts} customers={customers} />
                    </Card> : ''
                }
            </div>

            <Card className='mt-4 @container/card'>
                <CardHeader>
                    <CardTitle>Status das Operações</CardTitle>
                </CardHeader>
                <CardContent className="px-2">
                    <Tabs defaultValue="va">

                        <div className="w-full overflow-x-auto">
                            <TabsList className="w-max min-w-full flex-nowrap">

                                <TabsTrigger className="px-2 whitespace-nowrap" value="va">
                                    Agendamentos
                                    <Badge className="text-xs ml-1">{orders?.agendados.length}</Badge>
                                </TabsTrigger>

                                <TabsTrigger className="px-2 whitespace-nowrap" value="og">
                                    Orçam. gerados
                                    <Badge className="text-xs ml-1">{orders?.gerados.length}</Badge>
                                </TabsTrigger>

                                <TabsTrigger className="px-2 whitespace-nowrap" value="oa">
                                    Orçam. aprovados
                                    <Badge className="text-xs ml-1">{orders?.aprovados.length}</Badge>
                                </TabsTrigger>

                                <TabsTrigger className="px-2 whitespace-nowrap" value="ca">
                                    Serv. concluído aguardando retirada
                                    <Badge className="text-xs ml-1">{orders?.concluidosca.length}</Badge>
                                </TabsTrigger>

                                <TabsTrigger className="px-2 whitespace-nowrap" value="cn">
                                    Serv. concluído
                                    <Badge className="text-xs ml-1">{orders?.concluidoscn.length}</Badge>
                                </TabsTrigger>

                                <TabsTrigger className="px-2 whitespace-nowrap" value="fb">
                                    Equip. Entregue há 7 dias
                                    <Badge className="text-xs ml-1">{orders?.feedback.length}</Badge>
                                </TabsTrigger>

                            </TabsList>
                            <TabsContent value="va" className='max-h-48 overflow-y-auto'>
                                <div className='text-xs font-semibold py-1'>Visitas agendadas pelo número do agendamento</div>
                                <div className='py-2 border-t flex flex-wrap gap-2'>
                                    {orders?.agendados.map((age: any) => (
                                        <Button key={age.id} variant={'secondary'} asChild>
                                            <Link href={route('app.schedules.index', { "q": age.id, "init": true })}>
                                                {age.schedules_number}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="og" className='max-h-48 overflow-y-auto'>
                                <div className='text-xs font-semibold py-1'>Orçamentos gerados por número de ordem</div>
                                <div className='py-2 border-t flex flex-wrap gap-2'>
                                    {orders?.gerados.map((ger: any) => (
                                        <Button key={ger.id} variant={'secondary'} asChild>
                                            <Link href={route('app.orders.index', { "q": ger.id, "init": true })}>
                                                {ger.order_number}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="oa" className='max-h-48 overflow-y-auto'>
                                <div className='text-xs font-semibold py-1'>Orçamentos aprovados por número de ordem</div>
                                <div className='py-2 border-t flex flex-wrap gap-2'>
                                    {orders?.aprovados.map((apro: any) => (
                                        <Button key={apro.id} variant={'secondary'} asChild>
                                            <Link href={route('app.orders.index', { "q": apro.id, "init": true })}>
                                                {apro.order_number}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="ca" className='max-h-48 overflow-y-auto'>
                                <div className='text-xs font-semibold py-1'>Serviços concluídos por número de ordem e clientes avisados</div>
                                <div className='py-2 border-t flex flex-wrap gap-2'>
                                    {orders?.concluidosca.map((conca: any) => (
                                        <Button key={conca.id} variant={'secondary'} asChild>
                                            <Link href={route('app.orders.index', { "q": conca.id, "init": true })}>
                                                {conca.order_number}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="cn" className='max-h-48 overflow-y-auto'>
                                <div className='text-xs font-semibold py-1'>Serviços concluídos por número de ordem e clientes não avisados</div>
                                <div className='py-2 border-t flex flex-wrap gap-2'>
                                    {orders?.concluidoscn.map((concn: any) => (
                                        <Button key={concn.id} variant={'secondary'} asChild>
                                            <Link href={route('app.orders.index', { "q": concn.id, "init": true })}>
                                                {concn.order_number}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="fb" className='max-h-48 overflow-y-auto'>
                                <div className='text-xs font-semibold py-1'>Serviços a sete dias para provável feedback</div>
                                <div className='py-2 border-t flex flex-wrap gap-2'>
                                    {orders?.feedback.map((ger: any) => (
                                        <Button
                                            key={ger.id}
                                            variant={'secondary'}
                                            asChild
                                        >
                                            <Link href={route('app.orders.index', { "q": ger.id, "init": true, "fd": 1 })} className='relative'>
                                                {ger.feedback && <Check className='h-4 w-4 absolute -top-1 -right-1' />}
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
            <div className='mt-4'>
                <div>
                    <ChartAreaDashboard timerange={timerange} />
                </div>
                <div className='mt-4'>
                    <ChartFluxoOrders timerange={timerange} />
                </div>
            </div>
        </div>
    );
}
