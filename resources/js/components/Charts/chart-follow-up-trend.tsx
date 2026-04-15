import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

const chartConfig = {
    rate: {
        label: 'Taxa (%)',
        color: '#0f766e',
    },
} satisfies ChartConfig;

export function ChartFollowUpTrend({
    title,
    description,
    trend,
}: {
    title: string;
    description: string;
    trend?: { granularity?: string; data?: Array<{ label: string; rate: number; contacted: number; recovered: number }> };
}) {
    const data = trend?.data ?? [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
                    <LineChart data={data} margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
                        <YAxis tickLine={false} axisLine={false} width={44} domain={[0, 'auto']} />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value, _name, item: any) => (
                                        <>
                                            <span>Taxa</span>
                                            <span>{Number(value).toFixed(1)}%</span>
                                            <span className="text-muted-foreground block w-full text-[11px]">
                                                {item?.payload?.recovered ?? 0} recuperado(s) / {item?.payload?.contacted ?? 0} contato(s)
                                            </span>
                                        </>
                                    )}
                                />
                            }
                        />
                        <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
