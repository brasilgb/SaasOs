import * as React from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import moment from 'moment';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';

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
    const isMobile = useIsMobile();
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

    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {};

        lines.forEach((line, index) => {
            config[line.key] = {
                label: line.label,
                color: `var(--chart-${index + 1})`,
            };
        });

        return config;
    }, [lines]);

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
                    <LineChart data={chartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />

                        <XAxis
                            dataKey="date"
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
                                    labelFormatter={(value) =>
                                        new Date(value).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                        })
                                    }
                                    indicator="dot"
                                />
                            }
                        />

                        {lines.map((line, index) => (
                            <Line
                                key={line.key}
                                type="monotone"
                                dataKey={line.key}
                                stroke={`var(--chart-${index + 1})`}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                                animationDuration={500}
                            />
                        ))}
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
