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
import { Head, Link, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash2Icon, UserCog } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel',
        href: route('app.dashboard'),
    },
    {
        title: 'Usuários',
        href: '#',
    },
];

export default function Users({ users, firstAdminId, search }: any) {
    const { auth } = usePage<{ auth?: { permissions?: string[] } }>().props;
    const permissions = auth?.permissions ?? [];
    const canCreateUsers = permissions.includes('users') || permissions.includes('users.create');
    const canUpdateUsers = permissions.includes('users') || permissions.includes('users.update');
    const canDeleteUsers = permissions.includes('users') || permissions.includes('users.delete');

    return (
        <AppLayout>
            <Head title="Usuários" />
            <div className="flex min-h-16 flex-col justify-center gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
                <div className="flex items-center gap-2">
                    <Icon iconNode={UserCog} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Usuários</h2>
                </div>
                <div className="min-w-0 self-start sm:self-auto">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full lg:flex-none">
                    <InputSearch placeholder="Buscar usuário por nome" url="app.users.index" className="lg:w-[420px]" />
                </div>
                <div className="flex w-full justify-end lg:w-auto lg:flex-none">
                    {canCreateUsers && (
                        <Button variant={'default'} asChild className="w-full whitespace-nowrap sm:w-auto">
                            <Link href={route('app.users.create')}>
                                <Plus className="h-4 w-4" />
                                <span>Novo usuário</span>
                            </Link>
                        </Button>
                    )}
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
                                <TableHead className="min-w-[120px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.data.length > 0 ? (
                                users?.data?.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.user_number}</TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell className="font-medium">{maskPhone(user.telephone)}</TableCell>
                                        <TableCell>{<StatusBadge category="role" value={user.roles} />}</TableCell>
                                        <TableCell>{<StatusBadge category="userStatus" value={user.status} />}</TableCell>
                                        <TableCell>{moment(user.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="min-w-[120px]">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {canUpdateUsers && (
                                                    <Button
                                                        asChild
                                                        size="icon"
                                                        className="bg-orange-500 text-white hover:bg-orange-600"
                                                        title="Editar usuário"
                                                    >
                                                        <Link
                                                            href={route('app.users.edit', user.id)}
                                                            data={{ page: users.current_page, search: search }}
                                                            aria-label={`Editar usuário ${user.name}`}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                {canDeleteUsers &&
                                                    (user.roles === 9 && user.id === firstAdminId ? (
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            disabled={true}
                                                            title="Administrador principal não pode ser excluído"
                                                        >
                                                            <Trash2Icon className="h-4 w-4" />
                                                        </Button>
                                                    ) : (
                                                        <ActionDelete title={'este usuário'} url={'app.users.destroy'} param={user.id} />
                                                    ))}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="flex h-16 w-full items-center justify-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        {users?.data.length > users?.total && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={8}>
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
