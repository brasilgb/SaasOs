import AlertSuccess from '@/components/app-alert-success';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import React, { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Icon } from '@/components/icon';
import { LayoutGridIcon } from 'lucide-react';
import OrderDashboard from './Orders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinanceiroOrders from './Financeiro/ordens';

export default function Dashboard({ reloadKey, orders, acount, parts, customers, others, }: any) {
    const { flash } = usePage().props as any;
    const [timeRange, setTimeRange] = useState("7")

    return (
        <AppLayout>
            {flash?.message && <AlertSuccess message={flash?.message} />}
            <Head title="Dashboard" />
            <div key={reloadKey}>
                <div className='p-4'>
                    <div className='h-16 flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Icon iconNode={LayoutGridIcon} className='w-8 h-8' />
                            <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
                        </div>

                        <div className='flex items-center justify-center gap-4'>
                            <div>Intervalo de análise</div>
                            <ToggleGroup
                                type="single"
                                value={timeRange}
                                onValueChange={(value) => value && setTimeRange(value)}
                                className="flex gap-2 p-1 bg-muted rounded-lg"
                            >
                                <ToggleGroupItem
                                    value="7"
                                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                >
                                    7 dias
                                </ToggleGroupItem>

                                <ToggleGroupItem
                                    value="30"
                                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                >
                                    30 dias
                                </ToggleGroupItem>

                                <ToggleGroupItem
                                    value="60"
                                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                >
                                    60 dias
                                </ToggleGroupItem>
                            </ToggleGroup>


                        </div>
                    </div>

                    <Tabs defaultValue="account" className="w-full">
                        <TabsList>
                            <TabsTrigger value="account">Operacional</TabsTrigger>
                            <TabsTrigger value="password">Financeiro</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                            <OrderDashboard timerange={timeRange} parts={parts} customers={customers} others={others} orders={orders} acount={acount} />
                        </TabsContent>
                        <TabsContent value="password">
                            <FinanceiroOrders timerange={timeRange} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    )
}
