import ActionDelete from '@/components/action-delete';
import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ClipboardCheck } from 'lucide-react';
import moment from 'moment';
import CreateChecklist from './create-checklist';
import EditChecklist from './edit-checklist';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel',
        href: route('app.dashboard'),
    },
    {
        title: 'Checklists',
        href: '#',
    },
];

export default function CheckList({ equipments, checklists }: any) {
    const { auth } = usePage<{ auth?: { permissions?: string[] } }>().props;
    const canManageChecklists = auth?.permissions?.includes('register_checklists');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Checklists" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={ClipboardCheck} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Checklists</h2>
                </div>
            </div>
            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full min-w-0 lg:max-w-[420px] lg:flex-1">
                    <InputSearch placeholder="Buscar checklist ou equipamento" url="app.register-checklists.index" />
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:shrink-0 lg:justify-end">
                    {canManageChecklists && <CreateChecklist equipments={equipments} />}
                </div>
            </div>

            <div className="p-4">
                <PaginationSummary data={checklists} />
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">#</TableHead>
                                <TableHead>Equipamento</TableHead>
                                <TableHead>Checklist</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead className="min-w-[120px]"></TableHead>
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
                                        <TableCell className="min-w-[120px]">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {canManageChecklists && <EditChecklist checklist={checklist} equipments={equipments} />}
                                                {canManageChecklists && (
                                                    <ActionDelete
                                                        title={'este checklist'}
                                                        url={'app.register-checklists.destroy'}
                                                        param={checklist.id}
                                                    />
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
