import { KpiDashboard } from '@/components/kpi-dashboard';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Calendar, MessageSquareMore, User, Users, Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { ChartAreaDashboard } from '@/components/chart-area-dashboard';
import { Badge } from '@/components/ui/badge';

export default function Dashboard({ orders, acount, chartequipments }: { orders: any, acount: any, chartequipments: any }) {

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className='p-4'>
                <div className="grid md:grid-cols-5 gap-4 rounded-xl">
                    <KpiDashboard link={route('app.users.index')} title="Usuários" value={acount?.numuser} icon={<User className='h-10 w-10' />} description="Usários do sistema" />
                    <KpiDashboard link={route('app.customers.index')} title="Clientes" value={acount?.numcust} icon={<Users className='h-10 w-10' />} description="Todos os clientes cadastrados" />
                    <KpiDashboard link={route('app.orders.index')} title="Ordens" value={acount?.numorde} icon={<Wrench className='h-10 w-10' />} description="Todas as ordens emitidas" />
                    <KpiDashboard link={route('app.schedules.index')} title="Agendamentos" value={acount?.numshed} icon={<Calendar className='h-10 w-10' />} description="Todos os agendamentos efetuados" />
                    <KpiDashboard link={route('app.messages.index')} title="Mensagens" value={acount?.nummess} icon={<MessageSquareMore className='h-10 w-10' />} description="Mensagens enviadas e recebidas" />
                </div>

                <div className='mt-4'>
                    <Tabs defaultValue="va">
                        <TabsList className='w-full'>
                            <TabsTrigger className='px-2' value="va">Agendamentos <Badge className='text-xs'>{orders?.agendados.length}</Badge></TabsTrigger>
                            <TabsTrigger className='px-2' value="og">Orçam. gerados <Badge className='text-xs'>{orders?.gerados.length}</Badge></TabsTrigger>
                            <TabsTrigger className='px-2' value="oa">Orçam. aprovados <Badge className='text-xs'>{orders?.aprovados.length}</Badge></TabsTrigger>
                            <TabsTrigger className='px-2' value="ca">Serv. concluídos (CA) <Badge className='text-xs'>{orders?.concluidosca.length}</Badge></TabsTrigger>
                            <TabsTrigger className='px-2' value="cn">Serv. concluídos (CN) <Badge className='text-xs'>{orders?.concluidoscn.length}</Badge></TabsTrigger>
                            <TabsTrigger className='px-2' value="fb">Equip. Entregue há 30 dias <Badge className='text-xs'>{orders?.trintadias.length}</Badge></TabsTrigger>
                        </TabsList>
                        <TabsContent value="va">
                            <div className='text-xs font-semibold py-1'>Visitas agendadas pelo número do agendamento</div>
                            <div className='py-2 border-t flex flex-wrap gap-2'>
                                {orders?.agendados.map((age: any) => (
                                    <Button key={age.id} variant={'secondary'} asChild>
                                        <Link href={route('app.schedules.edit', age.id)}>
                                            {age.id}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="og">
                            <div className='text-xs font-semibold py-1'>Orçamentos gerados por número de ordem</div>
                            <div className='py-2 border-t flex flex-wrap gap-2'>
                                {orders?.gerados.map((ger: any) => (
                                    <Button key={ger.id} variant={'secondary'} asChild>
                                        <Link href={route('app.orders.edit', ger.id)}>
                                            {ger.id}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="oa">
                            <div className='text-xs font-semibold py-1'>Orçamentos aprovados por número de ordem</div>
                            <div className='py-2 border-t flex flex-wrap gap-2'>
                                {orders?.aprovados.map((apro: any) => (
                                    <Button key={apro.id} variant={'secondary'} asChild>
                                        <Link href={route('app.orders.edit', apro.id)}>
                                            {apro.id}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="ca">
                            <div className='text-xs font-semibold py-1'>Serviços concluídos por número de ordem e clientes avisados</div>
                            <div className='py-2 border-t flex flex-wrap gap-2'>
                                {orders?.concluidosca.map((conca: any) => (
                                    <Button key={conca.id} variant={'secondary'} asChild>
                                        <Link href={route('app.orders.edit', conca.id)}>
                                            {conca.id}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="cn">
                            <div className='text-xs font-semibold py-1'>Serviços concluídos por número de ordem e clientes não avisados</div>
                            <div className='py-2 border-t flex flex-wrap gap-2'>
                                {orders?.concluidoscn.map((concn: any) => (
                                    <Button key={concn.id} variant={'secondary'} asChild>
                                        <Link href={route('app.orders.edit', concn.id)}>
                                            {concn.id}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="fb">
                            <div className='text-xs font-semibold py-1'>Serviços a trinta dias para provável feedback</div>
                            <div className='py-2 border-t flex flex-wrap gap-2'>
                                {orders?.trintadias.map((ger: any) => (
                                    <Button key={ger.id} variant={'secondary'} asChild>
                                        <Link href={route('app.orders.edit', ger.id)}>
                                            {ger.id}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className='mt-4'>
                    <ChartAreaDashboard chartequipments={chartequipments} />
                </div>
            </div>
        </AppLayout>
    );
}