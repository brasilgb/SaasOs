import { Breadcrumbs } from '@/components/breadcrumbs';
import { ChartQualityTrend } from '@/components/Charts/chart-quality-trend';
import { DatePicker } from '@/components/date-picker';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { connectBackend } from '@/Utils/connectApi';
import { Head } from '@inertiajs/react';
import { AlertTriangle, ShieldAlert, ShieldCheck, ShieldEllipsis } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Ações de garantia',
        href: route('app.quality.index'),
    },
];

function formatDateRange(date?: Date | string) {
    if (!date) return '';

    const d = date instanceof Date ? date : new Date(date);
    return moment(d).format('DD/MM/YYYY');
}

function severityConfig(severity: string) {
    if (severity === 'Critico') {
        return {
            label: 'Crítico',
            cardClass: 'border-amber-300 bg-amber-50',
            textClass: 'text-amber-900',
            icon: AlertTriangle,
        };
    }

    if (severity === 'Atencao') {
        return {
            label: 'Atenção',
            cardClass: 'border-blue-200 bg-blue-50',
            textClass: 'text-blue-900',
            icon: ShieldEllipsis,
        };
    }

    return {
        label: 'Saudável',
        cardClass: 'border-emerald-200 bg-emerald-50',
        textClass: 'text-emerald-900',
        icon: ShieldCheck,
    };
}

function RankingCard({ title, items, emptyText }: { title: string; items?: Array<{ label: string; total: number }>; emptyText: string }) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {items && items.length > 0 ? (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.label} className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
                                <span className="text-sm">{item.label}</span>
                                <Badge variant="secondary">{item.total}</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">{emptyText}</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function QualityIndicators() {
    const [timeRange, setTimeRange] = useState('7');
    const [dateRange, setDateRange] = useState<any>({});
    const [metrics, setMetrics] = useState<any>(null);

    const hasCustomRange = dateRange?.from && dateRange?.to;
    const timerangeForRequests = hasCustomRange
        ? Math.max(1, Math.ceil((new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / (1000 * 60 * 60 * 24)) + 1)
        : Number(timeRange);

    const timerangeLabel = hasCustomRange
        ? `${formatDateRange(dateRange.from)} até ${formatDateRange(dateRange.to)}`
        : timeRange === '1'
          ? 'Hoje'
          : `${timeRange} dias`;

    useEffect(() => {
        const loadMetrics = async () => {
            const query = new URLSearchParams();

            if (hasCustomRange && dateRange?.from && dateRange?.to) {
                query.set('from', moment(dateRange.from).format('YYYY-MM-DD'));
                query.set('to', moment(dateRange.to).format('YYYY-MM-DD'));
            }

            const url = `quality-indicators/metrics/${timerangeForRequests}${query.toString() ? `?${query.toString()}` : ''}`;
            const response = await connectBackend.get(url);
            setMetrics(response.data);
        };

        void loadMetrics();
    }, [timeRange, dateRange, hasCustomRange, timerangeForRequests]);

    const onTimeRangeChange = (value: string) => {
        if (!value) return;

        setTimeRange(value);
        if (value !== 'custom') {
            setDateRange({});
        }
    };

    const onDateRangeChange = (range: any) => {
        setDateRange(range);

        if (range?.from && range?.to) {
            setTimeRange('custom');
        } else if (timeRange === 'custom') {
            setTimeRange('7');
        }
    };

    const summary = metrics?.summary;
    const comparison = metrics?.comparison;
    const severity = severityConfig(summary?.severity ?? 'Saudavel');
    const SeverityIcon = severity.icon;
    const comparisonLabel =
        comparison?.direction === 'melhorou'
            ? 'Melhorou'
            : comparison?.direction === 'piorou'
              ? 'Piorou'
              : 'Estável';
    const comparisonTextClass =
        comparison?.direction === 'melhorou'
            ? 'text-emerald-800'
            : comparison?.direction === 'piorou'
              ? 'text-amber-900'
              : 'text-slate-700';

    return (
        <AppLayout>
            <Head title="Ações de garantia" />

            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={ShieldAlert} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Ações de garantia</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="p-4">
                <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs font-medium">Período: {timerangeLabel}</span>
                    </div>
                    <div className="w-full sm:w-auto">
                        <DatePicker mode={'range'} setDate={onDateRangeChange} date={dateRange} />
                    </div>
                    <div className="flex min-w-0 flex-col gap-2 xl:items-end">
                        <ToggleGroup
                            type="single"
                            value={timeRange}
                            onValueChange={onTimeRangeChange}
                            className="bg-muted flex w-full justify-start gap-2 overflow-x-auto rounded-lg p-1 sm:w-auto"
                        >
                            <ToggleGroupItem value="1" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                Hoje
                            </ToggleGroupItem>
                            <ToggleGroupItem value="7" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                7 dias
                            </ToggleGroupItem>
                            <ToggleGroupItem value="30" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                30 dias
                            </ToggleGroupItem>
                            <ToggleGroupItem value="60" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                60 dias
                            </ToggleGroupItem>
                            <ToggleGroupItem value="custom" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                Intervalo
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>

                <Card className={severity.cardClass}>
                    <CardHeader className="flex flex-row items-start justify-between gap-3">
                        <div>
                            <CardTitle className={`text-base ${severity.textClass}`}>Panorama da garantia</CardTitle>
                            <p className={`mt-2 text-sm ${severity.textClass}`}>
                                Situação {severity.label}. Taxa atual de retorno em garantia: {summary?.warranty_return_rate ?? 0}%,
                                com limite configurado de {summary?.warranty_return_threshold ?? 0}%.
                            </p>
                            <p className={`mt-2 text-sm font-medium ${comparisonTextClass}`}>
                                {comparisonLabel} em relação ao período anterior: {comparison?.previous_warranty_return_rate ?? 0}% antes,{' '}
                                variação de {comparison?.delta_rate ?? 0} p.p.
                            </p>
                        </div>
                        <SeverityIcon className={`h-6 w-6 shrink-0 ${severity.textClass}`} />
                    </CardHeader>
                </Card>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Ordens analisadas</CardTitle></CardHeader>
                        <CardContent className="text-3xl font-bold">{summary?.total_orders ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Retornos em garantia</CardTitle></CardHeader>
                        <CardContent className="text-3xl font-bold">{summary?.warranty_returns ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Retornos em aberto</CardTitle></CardHeader>
                        <CardContent className="text-3xl font-bold">{summary?.open_warranty_returns ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Clientes com retorno</CardTitle></CardHeader>
                        <CardContent className="text-3xl font-bold">{summary?.affected_customers ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Média até o retorno</CardTitle></CardHeader>
                        <CardContent className="text-3xl font-bold">{summary?.avg_days_to_return ?? 0}d</CardContent>
                    </Card>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-3">
                    <RankingCard
                        title="Equipamentos com mais reincidência"
                        items={metrics?.top_equipments}
                        emptyText="Nenhum retorno em garantia no período."
                    />
                    <RankingCard
                        title="Defeitos com mais reincidência"
                        items={metrics?.top_defects}
                        emptyText="Nenhum defeito recorrente em garantia no período."
                    />
                    <RankingCard
                        title="Técnicos com mais reincidência"
                        items={metrics?.top_technicians}
                        emptyText="Nenhum técnico associado a retorno no período."
                    />
                </div>

                <div className="mt-4">
                    <ChartQualityTrend trend={metrics?.trend} threshold={summary?.warranty_return_threshold} />
                </div>

                <div className="mt-4">
                    <RankingCard
                        title="Situação atual dos retornos em garantia"
                        items={metrics?.status_breakdown?.map((item: any) => ({ label: item.label, total: item.total }))}
                        emptyText="Nenhum retorno em garantia no período."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
