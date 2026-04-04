import { useIsMobile } from '@/hooks/use-mobile';
import { connectBackend } from '@/Utils/connectApi';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

type OrdersPoint = {
    period: string;
    entradas: number;
    concluidos: number;
    entregues: number;
};

export default function ChartFluxoOrders({ timerange, dateRange, customRange }: { timerange: string | number; dateRange?: any; customRange?: boolean }) {
    const isMobile = useIsMobile();

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
                    <LineChart data={orders}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />

                        <XAxis
                            dataKey="period"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);

                                return date.toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                });
                            }}
                        />

                        <ChartTooltip
                            cursor={false}
                            defaultIndex={isMobile ? -1 : 10}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                        });
                                    }}
                                    indicator="dot"
                                />
                            }
                        />

                        <Line type="monotone" dataKey="entradas" stroke="var(--chart-1)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />

                        <Line type="monotone" dataKey="concluidos" stroke="var(--chart-2)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />

                        <Line type="monotone" dataKey="entregues" stroke="var(--chart-3)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
