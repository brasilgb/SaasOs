import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PackagePlus } from 'lucide-react';
import moment from 'moment';
import CreateChecklist from './create-checklist';
import EditChecklist from './edit-checklist';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Checllist',
        href: '#',
    },
];

export default function CheckList({ equipments, checklists }: any) {
    return (
        <AppLayout>
            <Head title="Checklists" />

            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={PackagePlus} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Checklists</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full">
                    <InputSearch placeholder="Buscar checklist ou equipamento" url="app.register-checklists.index" />
                </div>
                <div className="flex w-full justify-end">
                    <CreateChecklist equipments={equipments} />
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">#</TableHead>
                                <TableHead>Equipamento</TableHead>
                                <TableHead>Checklist</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {checklists?.data.length ? (
                                checklists?.data?.map((checklist: any) => (
                                    <TableRow key={checklist.checklist_number}>
                                        <TableCell>{checklist.id}</TableCell>
                                        <TableCell className="font-medium">{checklist.equipment.equipment}</TableCell>
                                        <TableCell className="font-medium">{checklist.checklist}</TableCell>
                                        <TableCell>{moment(checklist.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="flex justify-end gap-2">
                                            <EditChecklist checklist={checklist} equipments={equipments} />
                                            <ActionDelete title={'este checklist'} url={'app.register-checklists.destroy'} param={checklist.id} />
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
                                    <AppPagination data={checklists} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
