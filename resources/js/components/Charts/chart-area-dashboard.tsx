import * as React from 'react';
import { Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import moment from 'moment';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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

    const pieData = React.useMemo(() => {
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
        const config: ChartConfig = {};

        pieData.forEach((item) => {
            config[item.key] = {
                label: item.label,
                color: item.fill,
            };
        });

        return config;
    }, [pieData]);

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
