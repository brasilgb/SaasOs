import { connectBackend } from '@/Utils/connectApi';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

type OrdersPoint = {
    period: string;
    entradas: number;
    concluidos: number;
    entregues: number;
};

export default function ChartFluxoOrders({ timerange, dateRange, customRange }: { timerange: string | number; dateRange?: any; customRange?: boolean }) {
    const [orders, setOrders] = useState<OrdersPoint[]>([]);

    function formatIsoDate(date: Date | string) {
        const d = date instanceof Date ? date : new Date(date);
        return moment(d).format('YYYY-MM-DD');
    }

    function formatBrDate(date: Date | string) {
        const d = date instanceof Date ? date : new Date(date);
        return moment(d).format('DD/MM/YYYY');
    }

    useEffect(() => {
        const getOrders = async () => {
            try {
                const query = new URLSearchParams();

                if (customRange && dateRange?.from && dateRange?.to) {
                    query.set('from', formatIsoDate(dateRange.from));
                    query.set('to', formatIsoDate(dateRange.to));
                }

                const response = await connectBackend.get(`fluxsOrders/${timerange}${query.toString() ? `?${query.toString()}` : ''}`);
                setOrders(response.data);
            } catch (error) {
                console.error('Erro ao carregar dados do gráfico Fluxo de ordens', error);
            }
        };
        getOrders();
    }, [timerange, customRange, dateRange]);

    const chartConfig = {
        entradas: {
            label: 'Entradas',
            color: 'var(--chart-1)',
        },
        concluidos: {
            label: 'Concluídos',
            color: 'var(--chart-2)',
        },
        entregues: {
            label: 'Entregues',
            color: 'var(--chart-3)',
        },
    };

    const pieData = [
        {
            key: 'entradas',
            label: 'Entradas',
            value: orders.reduce((acc, item) => acc + Number(item.entradas || 0), 0),
            fill: 'var(--chart-1)',
        },
        {
            key: 'concluidos',
            label: 'Concluídos',
            value: orders.reduce((acc, item) => acc + Number(item.concluidos || 0), 0),
            fill: 'var(--chart-2)',
        },
        {
            key: 'entregues',
            label: 'Entregues',
            value: orders.reduce((acc, item) => acc + Number(item.entregues || 0), 0),
            fill: 'var(--chart-3)',
        },
    ].filter((item) => item.value > 0);

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>
                    {customRange && dateRange?.from && dateRange?.to
                        ? `Fluxo de Ordens • ${formatBrDate(dateRange.from)} até ${formatBrDate(dateRange.to)}`
                        : `Fluxo de Ordens Últimos • ${timerange} dias`}
                </CardTitle>

                <CardDescription>
                    <span className="hidden @[540px]/card:block">Entradas x Concluídos x Entregues</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="key" hideLabel />} />
                        <Pie data={pieData} dataKey="value" nameKey="label" innerRadius={45} outerRadius={80} strokeWidth={2} />
                        <ChartLegend align="left" verticalAlign="middle" layout="vertical" content={<ChartLegendContent nameKey="key" className="flex-col items-start justify-start pl-2 pt-0" />} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
