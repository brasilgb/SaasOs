import { Area, CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
    total: {
        label: 'Total',
        color: 'var(--chart-1)',
    },
    services: {
        label: 'Serviços',
        color: 'var(--chart-2)',
    },
    parts: {
        label: 'Peças',
        color: 'var(--chart-3)',
    },
} satisfies ChartConfig;

type FinancialRevenuePoint = {
    date: string;
    total: number;
    services: number;
    parts: number;
};

export function FinancialRevenueChart({ data }: { data: FinancialRevenuePoint[] }) {
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
                            // formatter={(value) => currencyFormatter(Number(value))}
                            labelFormatter={(value) =>
                                new Date(value).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                })
                            }
                        />
                    }
                />

                {/* Área somente no TOTAL */}

                <Area dataKey="total" type="monotone" fill="var(--color-total)" fillOpacity={0.08} stroke="none" />

                {/* Linhas */}

                <Line dataKey="total" type="monotone" stroke="var(--color-total)" strokeWidth={3} dot={false} />

                <Line dataKey="services" type="monotone" stroke="var(--color-services)" strokeWidth={2} dot={false} />

                <Line dataKey="parts" type="monotone" stroke="var(--color-parts)" strokeWidth={2} dot={false} />
            </LineChart>
        </ChartContainer>
    );
}
