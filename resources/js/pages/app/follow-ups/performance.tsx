import { Breadcrumbs } from '@/components/breadcrumbs';
import { ChartFollowUpTrend } from '@/components/Charts/chart-follow-up-trend';
import { DatePicker } from '@/components/date-picker';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Performance comercial', href: route('app.follow-ups.performance') },
];

function formatDateRange(date?: Date | string) {
    if (!date) return '';

    const d = date instanceof Date ? date : new Date(date);
    return moment(d).format('DD/MM/YYYY');
}

export default function FollowUpPerformance({ filters, summary, trends }: any) {
    const [dateRange, setDateRange] = useState<any>({
        from: filters?.from,
        to: filters?.to,
    });

    const onDateRangeChange = (range: any) => {
        setDateRange(range);

        if (range?.from && range?.to) {
            router.get(
                route('app.follow-ups.performance'),
                {
                    from: moment(range.from).format('YYYY-MM-DD'),
                    to: moment(range.to).format('YYYY-MM-DD'),
                },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }
    };

    const metricsPeriodLabel =
        dateRange?.from && dateRange?.to
            ? `${formatDateRange(dateRange.from)} até ${formatDateRange(dateRange.to)}`
            : '';
    const previousPeriodLabel =
        summary?.comparison?.period?.from && summary?.comparison?.period?.to
            ? `${moment(summary.comparison.period.from).format('DD/MM/YYYY')} até ${moment(summary.comparison.period.to).format('DD/MM/YYYY')}`
            : '';

    const directionLabel = (direction?: string) => {
        if (direction === 'melhorou') return 'Melhorou';
        if (direction === 'piorou') return 'Piorou';
        return 'Estável';
    };

    const targetLabel = (status?: string) => (status === 'saudavel' ? 'Meta atingida' : 'Abaixo da meta');

    return (
        <AppLayout>
            <Head title="Performance comercial" />

            <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={BarChart3} className="h-8 w-8" />
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Performance comercial</h2>
                        <p className="text-muted-foreground text-sm">
                            Entenda se os contatos com clientes estão ajudando a aprovar orçamentos e receber pagamentos pendentes.
                        </p>
                    </div>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="p-4">
                <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs font-medium">Período: {metricsPeriodLabel}</span>
                    </div>
                    <div className="w-full sm:w-auto">
                        <DatePicker mode="range" setDate={onDateRangeChange} date={dateRange} />
                    </div>
                </div>

                <div className="mb-4 grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Comparação de aprovação de orçamento</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-2xl font-bold">{directionLabel(summary?.comparison?.budget?.direction)}</div>
                            <div className="text-muted-foreground text-sm">
                                Atual: {summary?.comparison?.budget?.current ?? 0}% | anterior: {summary?.comparison?.budget?.previous ?? 0}%
                            </div>
                            <div className="text-muted-foreground text-xs">
                                Variação de {summary?.comparison?.budget?.delta ?? 0} p.p. comparado a {previousPeriodLabel}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Comparação de pagamento após cobrança</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-2xl font-bold">{directionLabel(summary?.comparison?.payment?.direction)}</div>
                            <div className="text-muted-foreground text-sm">
                                Atual: {summary?.comparison?.payment?.current ?? 0}% | anterior: {summary?.comparison?.payment?.previous ?? 0}%
                            </div>
                            <div className="text-muted-foreground text-xs">
                                Variação de {summary?.comparison?.payment?.delta ?? 0} p.p. comparado a {previousPeriodLabel}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Aprovação de orçamento</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-3xl font-bold">{summary?.commercial?.budget?.rate ?? 0}%</div>
                            <div className="text-muted-foreground text-sm">
                                {summary?.commercial?.budget?.approved ?? 0} aprovados de {summary?.commercial?.budget?.contacted ?? 0}
                            </div>
                            <Badge variant="secondary" className={summary?.targets?.budget?.status === 'saudavel' ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-100' : 'bg-amber-100 text-amber-900 hover:bg-amber-100'}>
                                {targetLabel(summary?.targets?.budget?.status)} | meta {summary?.targets?.budget?.target ?? 0}%
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Pagamento após cobrança</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-3xl font-bold">{summary?.commercial?.payment?.rate ?? 0}%</div>
                            <div className="text-muted-foreground text-sm">
                                {summary?.commercial?.payment?.recovered ?? 0} recuperadas de {summary?.commercial?.payment?.contacted ?? 0}
                            </div>
                            <Badge variant="secondary" className={summary?.targets?.payment?.status === 'saudavel' ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-100' : 'bg-amber-100 text-amber-900 hover:bg-amber-100'}>
                                {targetLabel(summary?.targets?.payment?.status)} | meta {summary?.targets?.payment?.target ?? 0}%
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Orçamento manual x automático</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {['manual', 'automatic'].map((trigger) => (
                                <div key={trigger} className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{trigger === 'manual' ? 'Manual' : 'Automático'}</span>
                                        <span className="text-muted-foreground text-xs">
                                            {summary?.trigger_performance?.budget?.[trigger]?.recovered ?? 0} de {summary?.trigger_performance?.budget?.[trigger]?.contacted ?? 0}
                                        </span>
                                    </div>
                                    <Badge variant="secondary">{summary?.trigger_performance?.budget?.[trigger]?.rate ?? 0}%</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Cobrança manual x automático</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {['manual', 'automatic'].map((trigger) => (
                                <div key={trigger} className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{trigger === 'manual' ? 'Manual' : 'Automático'}</span>
                                        <span className="text-muted-foreground text-xs">
                                            {summary?.trigger_performance?.payment?.[trigger]?.recovered ?? 0} de {summary?.trigger_performance?.payment?.[trigger]?.contacted ?? 0}
                                        </span>
                                    </div>
                                    <Badge variant="secondary">{summary?.trigger_performance?.payment?.[trigger]?.rate ?? 0}%</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Funil de orçamento</CardTitle></CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                                Aprovados: {summary?.commercial?.budget?.approved ?? 0}
                            </Badge>
                            <Badge variant="secondary" className="bg-rose-100 text-rose-900 hover:bg-rose-100">
                                Reprovados: {summary?.commercial?.budget?.rejected ?? 0}
                            </Badge>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-900 hover:bg-amber-100">
                                Pendentes: {summary?.commercial?.budget?.pending ?? 0}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Pagamentos cobrados no período</CardTitle></CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                                Recuperadas: {summary?.commercial?.payment?.recovered ?? 0}
                            </Badge>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-900 hover:bg-amber-100">
                                Em aberto: {summary?.commercial?.payment?.open ?? 0}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <ChartFollowUpTrend
                        title="Evolução da aprovação de orçamento"
                        description="Percentual de orçamentos que avançaram depois do contato com o cliente."
                        trend={trends?.budget}
                    />
                    <ChartFollowUpTrend
                        title="Evolução de pagamento após cobrança"
                        description="Percentual de cobranças que tiveram pagamento recebido depois do contato."
                        trend={trends?.payment}
                    />
                </div>

                <Card className="mt-4">
                    <CardHeader><CardTitle className="text-base">O que esta página mede</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">
                            Esta página mede o resultado dos contatos feitos pelo atendimento ou financeiro. Ela não mede produtividade ou qualidade técnica.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
