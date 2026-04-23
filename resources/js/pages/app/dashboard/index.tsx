import AlertSuccess from '@/components/app-alert-success';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DatePicker } from '@/components/date-picker';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { usePersistedPeriodFilter } from '@/hooks/use-persisted-period-filter';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { LayoutGridIcon, MessageSquareHeart } from 'lucide-react';
import moment from 'moment';
import FinanceiroOrders from './fin-order/ordens';
import FinanceiroSales from './fin-order/sales';
import OrderDashboard from './ope-order';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
];

function formatDateRange(date?: Date | string) {
    if (!date) return '';

    const d = date instanceof Date ? date : new Date(date);
    return moment(d).format('DD/MM/YYYY');
}

export default function Dashboard({
    reloadKey,
    orders,
    acount,
    parts,
    customers,
    others,
    listSchedules,
    cashier,
    flash,
    auth,
    tenantFeedbackRequest,
}: any) {
    const { timeRange, dateRange, setTimeRange, setDateRange, clearDateRange } = usePersistedPeriodFilter('dashboard-period-filter');
    const isTechnician = auth?.role === 'technician';
    const canUseSales = Boolean(auth?.permissions?.includes('sales') && others?.enablesales && !isTechnician);

    const hasCustomRange = dateRange?.from && dateRange?.to;

    const timerangeForRequests = hasCustomRange
        ? Math.max(1, Math.ceil((new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / (1000 * 60 * 60 * 24)) + 1)
        : Number(timeRange);

    const timerangeLabel = hasCustomRange
        ? `${formatDateRange(dateRange.from)} até ${formatDateRange(dateRange.to)}`
        : timeRange === '1'
          ? 'Hoje'
          : `${timeRange} dias`;

    const onTimeRangeChange = (value: string) => {
        if (!value) return;

        setTimeRange(value);
        if (value !== 'custom') {
            clearDateRange();
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

    return (
        <AppLayout>
            {flash?.message && <AlertSuccess message={flash?.message} />}
            <Head title="Dashboard" />
            <div key={reloadKey}>
                <div className="flex min-h-16 flex-col justify-center gap-3 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
                    <div className="flex items-center gap-2">
                        <Icon iconNode={LayoutGridIcon} className="h-8 w-8" />
                        <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
                    </div>
                    <div className="min-w-0 self-start sm:self-auto">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                <div className="p-4">
                    <div className={`${isTechnician ? 'mb-4' : 'mb-4 xl:mb-0'} flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between`}>
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

                    {tenantFeedbackRequest?.hasPending && (
                        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <MessageSquareHeart className="h-5 w-5 text-amber-900" />
                                <div className="text-sm text-amber-900">
                                    Queremos ouvir sua experiência com o SigmaOS.
                                    <Badge variant="secondary" className="ml-2 bg-white text-amber-900">
                                        Leva menos de 1 minuto
                                    </Badge>
                                </div>
                            </div>
                            <a
                                href={tenantFeedbackRequest.url}
                                className="text-sm font-medium text-amber-900 underline underline-offset-4"
                            >
                                Enviar feedback
                            </a>
                        </div>
                    )}

                    <Tabs defaultValue="account" className="w-full">
                        {!isTechnician && (
                            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 md:max-w-96">
                                <TabsTrigger value="account">Operacional</TabsTrigger>
                                <TabsTrigger value="password">Financeiro</TabsTrigger>
                                {canUseSales && <TabsTrigger value="sales">Vendas</TabsTrigger>}
                            </TabsList>
                        )}
                        <TabsContent value="account">
                            <OrderDashboard
                                timerange={timerangeForRequests}
                                dateRange={dateRange}
                                customRange={hasCustomRange}
                                parts={parts}
                                customers={customers}
                                others={others}
                                cashier={cashier}
                                orders={orders}
                                acount={acount}
                                listSchedules={listSchedules}
                                auth={auth}
                            />
                        </TabsContent>
                        {!isTechnician && (
                            <TabsContent value="password">
                                <FinanceiroOrders timerange={timerangeForRequests} dateRange={dateRange} customRange={hasCustomRange} />
                            </TabsContent>
                        )}
                        {canUseSales && (
                            <TabsContent value="sales">
                                <FinanceiroSales timerange={timerangeForRequests} dateRange={dateRange} customRange={hasCustomRange} />
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
