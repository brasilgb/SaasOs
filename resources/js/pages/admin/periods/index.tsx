import ActionDelete from '@/components/action-delete';
import AlertSuccess from '@/components/app-alert-success';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin/admin-layout';
import type { BreadcrumbItem, PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Palette } from 'lucide-react';
import moment from 'moment';
import CreatePeriod from './create-period';
import EditPeriod from './edit-period';

interface Plan {
    id: number;
    name: string;
}

interface Period {
    id: number;
    name: string;
    plan_id: number | string;
    interval: string;
    interval_count: string | number;
    price: string | number;
    created_at: string;
    plan: Plan;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active?: boolean }>;
    first_page_url: string | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    last_page_url: string | null;
}

interface PeriodsIndexProps {
    periods: PaginatedData<Period>;
    plans: Plan[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Períodos',
        href: '#',
    },
];

export default function PlansIndex({ periods, plans }: PeriodsIndexProps) {
    const { flash } = usePage<PageProps<{ flash?: { message?: string } }>>().props;

    return (
        <AdminLayout>
            <Head title="Períodos" />
            {flash?.message && <AlertSuccess message={flash.message} />}
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Palette} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Períodos</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className="flex items-center justify-between p-4">
                <div>
                    <InputSearch placeholder="Buscar período" url="admin.periodo.index" />
                </div>
                <div>
                    <CreatePeriod plans={plans} />
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Intervalo</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {periods.data.length > 0 ? (
                                periods.data.map((period) => (
                                    <TableRow key={period.id}>
                                        <TableCell>{period.id}</TableCell>
                                        <TableCell>{period.name}</TableCell>
                                        <TableCell>{period.plan.name}</TableCell>
                                        <TableCell>{period.interval}</TableCell>
                                        <TableCell>{period.price}</TableCell>
                                        <TableCell>{moment(period.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="flex justify-end gap-2">
                                            <EditPeriod plans={plans} period={period} />
                                            <ActionDelete title={'esta característica'} url={'admin.periods.destroy'} param={period.id} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="flex h-16 w-full items-center justify-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <AppPagination data={periods} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
}
