import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { PackagePlus } from 'lucide-react';
import moment from 'moment';
import CreateEquipment from './create-equipment';
import EditEquipment from './edit-equipment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Equipamentos',
        href: '#',
    },
];

export default function Equipment({ equipments, search }: any) {
    const { auth } = usePage<{ auth?: { permissions?: string[] } }>().props;
    const canManageEquipments = auth?.permissions?.includes('register_equipments');

    return (
        <AppLayout>
            <Head title="Equipamentos" />

            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={PackagePlus} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Equipamentos</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full">
                    <InputSearch placeholder="Buscar equipamento" url="app.register-equipments.index" />
                </div>
                <div className="flex w-full justify-end">
                    {canManageEquipments && <CreateEquipment />}
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">#</TableHead>
                                <TableHead>Equipamento</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {equipments?.data.length ? (
                                equipments?.data?.map((equipment: any) => (
                                    <TableRow key={equipment.id}>
                                        <TableCell>{equipment.equipment_number}</TableCell>
                                        <TableCell className="font-medium">{equipment.equipment}</TableCell>
                                        <TableCell>{moment(equipment.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="flex justify-end gap-2">
                                            {canManageEquipments && <EditEquipment equipment={equipment} />}
                                            {canManageEquipments && (
                                                <ActionDelete title={'esta marca'} url={'app.register-equipments.destroy'} param={equipment.id} />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="flex h-16 w-full items-center justify-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <AppPagination data={equipments} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
