import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskPhone } from '@/Utils/mask';
import { Head, Link } from '@inertiajs/react';
import { Edit, Plus, Trash2Icon, UserCog } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Usuários',
        href: '#',
    },
];

export default function Users({ users, firstAdminId, search }: any) {
    return (
        <AppLayout>
            <Head title="Usuários" />
            <div className="mb-4 flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={UserCog} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Usuários</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full">
                    <InputSearch placeholder="Buscar usuário por nome" url="app.users.index" />
                </div>
                <div className="flex w-full justify-end">
                    <Button variant={'default'} asChild>
                        <Link href={route('app.users.create')} className="w-full md:w-auto">
                            <Plus className="h-4 w-4" />
                            <span>Novo Usuário</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">#</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>E-mail</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Função</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.data.length > 0 ? (
                                users?.data?.map((user: any, idx: number) => (
                                    <TableRow key={user.idx}>
                                        <TableCell>{user.user_number}</TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell className="font-medium">{maskPhone(user.telephone)}</TableCell>
                                        <TableCell>{<StatusBadge category="role" value={user.roles} />}</TableCell>
                                        <TableCell>{<StatusBadge category="userStatus" value={user.status} />}</TableCell>
                                        <TableCell>{moment(user.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="flex justify-end gap-2">
                                            <Button asChild size="icon" className="bg-orange-500 text-white hover:bg-orange-600">
                                                <Link href={route('app.users.edit', user.id)} data={{ page: users.current_page, search: search }}>
                                                    <Edit />
                                                </Link>
                                            </Button>
                                            {user.roles === 9 && user.id === firstAdminId ? (
                                                <Button variant="destructive" size="icon" disabled={true}>
                                                    <Trash2Icon className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <ActionDelete title={'este usuário'} url={'app.users.destroy'} param={user.id} />
                                            )}
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
                        {users?.data.length > users?.total && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <AppPagination data={users} />
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
