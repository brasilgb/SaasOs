import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { connectBackend } from '@/Utils/connectApi';
import { BadgeDollarSign, ShoppingCart, TrendingUp, WalletCards } from 'lucide-react';
import moment from 'moment';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';

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
    expenses: number;
    profit: number;
};

type DateRangeValue = {
    from?: Date | string;
    to?: Date | string;
};

type SalesKpis = {
    today_revenue: number;
    today_expenses: number;
    today_profit: number;
    range_revenue: number;
    range_expenses: number;
    range_profit: number;
    daily_average: number;
    daily_expense_average: number;
    daily_profit_average: number;
    average_ticket: number;
    sales_count: number;
    sales_today_count: number;
};

const chartConfig = {
    total: {
        label: 'Vendas',
        color: 'var(--chart-1)',
    },
    profit: {
        label: 'Lucro',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

function SalesRevenueChart({ data }: { data: SalesRevenuePoint[] }) {
    const chartData = useMemo(
        () =>
            data.map((item) => ({
                ...item,
                dateLabel: moment(item.date).format('DD/MM'),
            })),
        [data],
    );

    return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ComposedChart data={chartData} margin={{ top: 8, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} minTickGap={18} />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={72}
                    tickFormatter={(value) =>
                        Number(value || 0).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            maximumFractionDigits: 0,
                        })
                    }
                />
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            labelFormatter={(_, payload) =>
                                payload?.[0]?.payload?.date ? moment(payload[0].payload.date).format('DD/MM/YYYY') : ''
                            }
                            formatter={(value, name) => {
                                const label = name === 'total' ? 'Vendas' : 'Lucro';
                                return (
                                    <div className="flex w-full items-center justify-between gap-3">
                                        <span>{label}</span>
                                        <span className="font-mono font-medium tabular-nums">
                                            {formatCurrency(Number(value || 0))}
                                        </span>
                                    </div>
                                );
                            }}
                        />
                    }
                />
                <Bar dataKey="total" name="total" fill="var(--color-total)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Line
                    type="monotone"
                    dataKey="profit"
                    name="profit"
                    stroke="var(--color-profit)"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </ComposedChart>
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
                query.set('from', moment().startOf('month').format('YYYY-MM-DD'));
                query.set('to', moment().endOf('month').format('YYYY-MM-DD'));

                const response = await connectBackend.get(`financialSalesRevenueChart/30?${query.toString()}`);
                setChartSalesFinancial(response.data);
            } catch (error) {
                console.error('Erro ao carregar gráfico financeiro de vendas', error);
            }
        };

        getSalesChart();
    }, []);

    const rangeLabel =
        customRange && dateRange?.from && dateRange?.to ? `${formatBrDate(dateRange.from)} a ${formatBrDate(dateRange.to)}` : `${timerange} dias`;

    return (
        <div className="min-w-0">

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <KpiCard
                    title="Vendas - Diário"
                    value={kpisSales?.today_revenue}
                    description="Faturamento de vendas concluídas hoje"
                    count={kpisSales?.sales_today_count}
                    icon={<BadgeDollarSign size={18} />}
                />

                <KpiCard
                    title={`Lucro Líquido - Período ${rangeLabel}`}
                    value={kpisSales?.range_profit}
                    description="Receita de vendas menos despesas lançadas"
                    count={kpisSales?.sales_count}
                    icon={<WalletCards size={18} />}
                />

                <KpiCard
                    title={`Despesas - Período ${rangeLabel}`}
                    value={kpisSales?.range_expenses}
                    description="Somatório de saídas de caixa e despesas lançadas"
                    count={kpisSales?.sales_count}
                    icon={<ShoppingCart size={18} />}
                />

                <KpiCard
                    title={`Média de Lucro - Período ${rangeLabel}`}
                    value={kpisSales?.daily_profit_average}
                    description="Média diária do lucro líquido no período"
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
                        <CardDescription>Mês corrente (do dia 01 ao último dia do mês): barras de vendas e linha de lucro</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <SalesRevenueChart data={chartSalesFinancial} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
