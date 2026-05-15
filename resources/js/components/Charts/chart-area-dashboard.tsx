import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import moment from 'moment';

import { connectBackend } from '@/Utils/connectApi';
import { useEffect, useState } from 'react';

type ChartLine = {
    key: string;
    label: string;
};

type ChartPoint = {
    date: string;
    [key: string]: string | number;
};

export function ChartAreaDashboard({ timerange, dateRange, customRange }: { timerange: string | number; dateRange?: any; customRange?: boolean }) {
    const [chartData, setChartData] = useState<ChartPoint[]>([]);
    const [lines, setLines] = useState<ChartLine[]>([]);

    function formatIsoDate(date: Date | string) {
        const d = date instanceof Date ? date : new Date(date);
        return moment(d).format('YYYY-MM-DD');
    }

    function formatBrDate(date: Date | string) {
        const d = date instanceof Date ? date : new Date(date);
        return moment(d).format('DD/MM/YYYY');
    }

    useEffect(() => {
        const getChartData = async () => {
            const query = new URLSearchParams();

            if (customRange && dateRange?.from && dateRange?.to) {
                query.set('from', formatIsoDate(dateRange.from));
                query.set('to', formatIsoDate(dateRange.to));
            }

            const response = await connectBackend.get(`chartEquipments/${timerange}${query.toString() ? `?${query.toString()}` : ''}`);

            setChartData(response.data.data);
            setLines(response.data.lines);
        };

        getChartData();
    }, [timerange, customRange, dateRange]);

    const barData = React.useMemo(() => {
        const grouped = new Map<string, { key: string; label: string; value: number; fill: string }>();

        lines.forEach((line, index) => {
            const label = String(line.label || '').trim() || 'Sem nome';
            const value = chartData.reduce((acc, item) => acc + Number(item[line.key] || 0), 0);

            if (value <= 0) {
                return;
            }

            const existing = grouped.get(label);
            if (existing) {
                existing.value += value;
                return;
            }

            grouped.set(label, {
                key: `equipment_${grouped.size + 1}`,
                label,
                value,
                fill: `var(--chart-${index + 1})`,
            });
        });

        return Array.from(grouped.values());
    }, [chartData, lines]);

    const chartConfig = React.useMemo(() => {
        return {
            value: {
                label: 'Equipamentos',
                color: 'var(--chart-1)',
            },
        } satisfies ChartConfig;
    }, []);

    function formatAxisLabel(label: string) {
        return label.length > 10 ? `${label.slice(0, 9)}...` : label;
    }

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>
                    {customRange && dateRange?.from && dateRange?.to
                        ? `Equipamentos recebidos • ${formatBrDate(dateRange.from)} até ${formatBrDate(dateRange.to)}`
                        : `Equipamentos recebidos • Últimos ${timerange} dias`}
                </CardTitle>

                <CardDescription>
                    <span className="hidden @[540px]/card:block">Total de equipamentos recebidos</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
                    <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} tickFormatter={formatAxisLabel} />
                        <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(value, _, item) => (
                                        <div className="flex w-full items-center justify-between gap-3">
                                            <span>{String(item.payload.label)}</span>
                                            <span className="font-mono font-medium tabular-nums">{Number(value || 0)}</span>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <Bar dataKey="value" name="value" radius={[4, 4, 0, 0]} maxBarSize={32}>
                            {barData.map((item) => (
                                <Cell key={item.key} fill={item.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
