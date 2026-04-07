import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { connectBackend } from '@/Utils/connectApi';
import { BadgeDollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import moment from 'moment';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Area, CartesianGrid, Line, LineChart, XAxis } from 'recharts';

function formatIsoDate(date: Date | string) {
    const d = date instanceof Date ? date : new Date(date);
    return moment(d).format('YYYY-MM-DD');
}

function formatBrDate(date: Date | string) {
    const d = date instanceof Date ? date : new Date(date);
    return moment(d).format('DD/MM/YYYY');
}

function formatCurrency(value?: number) {
    return Number(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

type SalesRevenuePoint = {
    date: string;
    total: number;
    paid: number;
    pending: number;
    partial: number;
};

type DateRangeValue = {
    from?: Date | string;
    to?: Date | string;
};

type SalesKpis = {
    today_revenue: number;
    range_revenue: number;
    daily_average: number;
    average_ticket: number;
    sales_count: number;
    sales_today_count: number;
};

const chartConfig = {
    total: {
        label: 'Total',
        color: 'var(--chart-1)',
    },
    paid: {
        label: 'Pagas',
        color: 'var(--chart-2)',
    },
    pending: {
        label: 'Pendentes',
        color: 'var(--chart-3)',
    },
    partial: {
        label: 'Parciais',
        color: 'var(--chart-4)',
    },
} satisfies ChartConfig;

function SalesRevenueChart({ data }: { data: SalesRevenuePoint[] }) {
    return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={data}>
                <CartesianGrid vertical={false} />

                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) =>
                        new Date(value).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                        })
                    }
                />

                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            indicator="dot"
                            labelFormatter={(value) =>
                                new Date(value).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                })
                            }
                        />
                    }
                />

                <Area dataKey="total" type="monotone" fill="var(--color-total)" fillOpacity={0.08} stroke="none" />

                <Line dataKey="total" type="monotone" stroke="var(--color-total)" strokeWidth={3} dot={false} />
                <Line dataKey="paid" type="monotone" stroke="var(--color-paid)" strokeWidth={2} dot={false} />
                <Line dataKey="pending" type="monotone" stroke="var(--color-pending)" strokeWidth={2} dot={false} />
                <Line dataKey="partial" type="monotone" stroke="var(--color-partial)" strokeWidth={2} dot={false} />
            </LineChart>
        </ChartContainer>
    );
}

function KpiCard({
    title,
    value,
    description,
    count,
    icon,
}: {
    title: string;
    value?: number;
    description: string;
    count?: number;
    icon: ReactNode;
}) {
    return (
        <Card className="h-full min-w-0">
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                <CardDescription>{title}</CardDescription>
                <div className="text-muted-foreground shrink-0">{icon}</div>
            </CardHeader>

            <CardContent className="space-y-3">
                <CardTitle className="truncate text-2xl font-bold tabular-nums 2xl:text-3xl">{formatCurrency(value)}</CardTitle>
                <div className="text-muted-foreground text-xs">{description}</div>
                <div className="text-muted-foreground border-t pt-2 text-xs">
                    {Number(count || 0)} {Number(count || 0) === 1 ? 'venda analisada' : 'vendas analisadas'}
                </div>
            </CardContent>
        </Card>
    );
}

export default function FinanceiroSales({
    timerange,
    dateRange,
    customRange,
}: {
    timerange: number;
    dateRange?: DateRangeValue;
    customRange?: boolean;
}) {
    const [kpisSales, setKpisSales] = useState<SalesKpis | null>(null);
    const [chartSalesFinancial, setChartSalesFinancial] = useState<SalesRevenuePoint[]>([]);

    useEffect(() => {
        const getSalesKpis = async () => {
            try {
                const query = new URLSearchParams();

                if (customRange && dateRange?.from && dateRange?.to) {
                    query.set('from', formatIsoDate(dateRange.from));
                    query.set('to', formatIsoDate(dateRange.to));
                }

                const response = await connectBackend.get(`kpisFinancialSales/${timerange}${query.toString() ? `?${query.toString()}` : ''}`);
                setKpisSales(response.data.kpis);
            } catch (error) {
                console.error('Erro ao carregar dados dos kpis de vendas', error);
            }
        };

        getSalesKpis();
    }, [timerange, customRange, dateRange]);

    useEffect(() => {
        const getSalesChart = async () => {
            try {
                const query = new URLSearchParams();

                if (customRange && dateRange?.from && dateRange?.to) {
                    query.set('from', formatIsoDate(dateRange.from));
                    query.set('to', formatIsoDate(dateRange.to));
                }

                const response = await connectBackend.get(`financialSalesRevenueChart/${timerange}${query.toString() ? `?${query.toString()}` : ''}`);
                setChartSalesFinancial(response.data);
            } catch (error) {
                console.error('Erro ao carregar gráfico financeiro de vendas', error);
            }
        };

        getSalesChart();
    }, [timerange, customRange, dateRange]);

    const rangeLabel =
        customRange && dateRange?.from && dateRange?.to ? `${formatBrDate(dateRange.from)} a ${formatBrDate(dateRange.to)}` : `${timerange} dias`;

    return (
        <div className="min-w-0">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                    title="Vendas - Diário"
                    value={kpisSales?.today_revenue}
                    description="Faturamento de vendas concluídas hoje"
                    count={kpisSales?.sales_today_count}
                    icon={<BadgeDollarSign size={18} />}
                />

                <KpiCard
                    title={`Vendas - Período ${rangeLabel}`}
                    value={kpisSales?.range_revenue}
                    description="Faturamento total de vendas no período"
                    count={kpisSales?.sales_count}
                    icon={<ShoppingCart size={18} />}
                />

                <KpiCard
                    title={`Média - Período ${rangeLabel}`}
                    value={kpisSales?.daily_average}
                    description="Média de faturamento diário no período"
                    count={kpisSales?.sales_count}
                    icon={<TrendingUp size={18} />}
                />

                <KpiCard
                    title={`Ticket Médio - Período ${rangeLabel}`}
                    value={kpisSales?.average_ticket}
                    description="Média por venda concluída no período"
                    count={kpisSales?.sales_count}
                    icon={<BadgeDollarSign size={18} />}
                />
            </div>

            <div className="mt-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Faturamento de vendas</CardTitle>
                        <CardDescription>Totais por status financeiro no período de {rangeLabel}</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <SalesRevenueChart data={chartSalesFinancial} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
