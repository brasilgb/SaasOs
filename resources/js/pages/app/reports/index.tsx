import { Breadcrumbs } from '@/components/breadcrumbs';
import { DatePicker } from '@/components/date-picker';
import { Icon } from '@/components/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage, useRemember } from '@inertiajs/react';
import { FileTextIcon } from 'lucide-react';
import CustomersReport from './customers-report';
import ExpensesReport from './expenses-report';
import OrdersStatistics from './order-statistics';
import OrdersDaily from './orders-daily';
import OrdersReport from './orders-report';
import PartsReport from './parts-report';
import SalesReport from './sales-report';
import SchedulesReport from './schedules-report';
import TechnicianProductivity from './technician-productivity';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Relatórios',
        href: '#',
    },
];

export default function Parts() {
    const { company, auth, othersetting } = usePage().props as any;
    const [dateRange, setDateRange] = useRemember<any>({
        from: new Date(),
        to: new Date(),
    }, 'reports-date-range');
    const permissions = auth?.permissions ?? [];
    const canViewOrders = permissions.includes('orders');
    const canViewCustomers = permissions.includes('customers');
    const canViewSchedules = permissions.includes('schedules');
    const canViewSales = Boolean(permissions.includes('sales') && othersetting?.enablesales);
    const canViewExpenses = Boolean(permissions.includes('sales') && othersetting?.enablesales);
    const canViewParts = permissions.includes('parts');

    return (
        <AppLayout>
            <Head title="Relatórios" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={FileTextIcon} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Relatórios</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Selecione um intervalo de datas e um módulo para gerar o relatório.</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-start">
                        <div className="w-full max-w-md">
                            <DatePicker mode={'range'} setDate={setDateRange} date={dateRange} />
                        </div>
                    </CardContent>
                    <CardContent className="flex flex-wrap items-start gap-4">
                        {canViewOrders && (
                            <div className="w-full md:w-[15.8%]">
                                <TechnicianProductivity dateRange={dateRange} company={company} />
                            </div>
                        )}

                        {canViewOrders && (
                            <div className="w-full md:w-[15.8%]">
                                <OrdersReport dateRange={dateRange} company={company} />
                            </div>
                        )}

                        {canViewOrders && (
                            <div className="w-full md:w-[15.8%]">
                                <OrdersStatistics dateRange={dateRange} company={company} />
                            </div>
                        )}

                        {canViewOrders && (
                            <div className="w-full md:w-[15.8%]">
                                <OrdersDaily dateRange={dateRange} company={company} />
                            </div>
                        )}

                        {canViewCustomers && (
                            <div className="w-full md:w-[15.8%]">
                                <CustomersReport dateRange={dateRange} company={company} />
                            </div>
                        )}

                        {canViewSchedules && (
                            <div className="w-full md:w-[15.8%]">
                                <SchedulesReport dateRange={dateRange} company={company} />
                            </div>
                        )}

                        {canViewSales && (
                            <div className="w-full md:w-[15.8%]">
                                <SalesReport dateRange={dateRange} company={company} />
                            </div>
                        )}

                        {canViewParts && (
                            <div className="w-full md:w-[15.8%]">
                                <PartsReport dateRange={dateRange} company={company} />
                            </div>
                        )}

                        {canViewExpenses && (
                            <div className="w-full md:w-[15.8%]">
                                <ExpensesReport dateRange={dateRange} company={company} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
