import ActionDelete from '@/components/action-delete';
import AlertSuccess from '@/components/app-alert-success';
import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { PackagePlus } from 'lucide-react';
import moment from 'moment';
import CreateService from './create-service';
import EditService from './edit-service';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel',
        href: route('app.dashboard'),
    },
    {
        title: 'Serviços',
        href: '#',
    },
];

export default function Services({ equipments, services, search }: any) {
    const { flash, auth } = usePage().props as any;
    const canManageServices = auth?.permissions?.includes('settings');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Serviços" />
            {flash.message && <AlertSuccess message={flash.message} />}
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={PackagePlus} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Serviços</h2>
                </div>
            </div>
            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full min-w-0 lg:max-w-[420px] lg:flex-1">
                    <InputSearch placeholder="Buscar serviço" url="app.register-services.index" />
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:shrink-0 lg:justify-end">
                    {canManageServices && <CreateService equipments={equipments} />}
                </div>
            </div>

            <div className="p-4">
                <PaginationSummary data={services} />
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">#</TableHead>
                                <TableHead>Equipamento</TableHead>
                                <TableHead>Serviço</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead className="min-w-[120px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services?.data.length ? (
                                services?.data?.map((service: any) => (
                                    <TableRow key={service.id}>
                                        <TableCell>{service.service_number}</TableCell>
                                        <TableCell className="font-medium">{service.equipment.equipment}</TableCell>
                                        <TableCell className="font-medium">{service.service}</TableCell>
                                        <TableCell>{moment(service.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="min-w-[120px]">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {canManageServices && <EditService service={service} equipments={equipments} />}
                                                {canManageServices && (
                                                    <ActionDelete title={'este serviço'} url={'app.register-services.destroy'} param={service.id} />
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="flex h-16 w-full items-center justify-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <AppPagination data={services} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
