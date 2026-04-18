import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin/admin-layout';
import { BreadcrumbItem } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head } from '@inertiajs/react';
import { HandCoins } from 'lucide-react';
import moment from 'moment';
import CreatePlan from './create-plan';
import EditPlan from './edit-plan';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Planos',
        href: '#',
    },
];

export default function PlansIndex({ plans }: any) {
    return (
        <AdminLayout>
            <Head title="Planos" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={HandCoins} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Planos</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className="flex items-center justify-between p-4">
                <div>
                    <InputSearch placeholder="Buscar plano" url="admin.plans.index" />
                </div>
                <div>
                    <CreatePlan />
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Ciclo</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans?.data.length > 0 ? (
                                plans?.data?.map((plan: any) => (
                                    <TableRow key={plan.id}>
                                        <TableCell>{plan.id}</TableCell>
                                        <TableCell>{plan.name}</TableCell>
                                        <TableCell>{plan.slug}</TableCell>
                                        <TableCell>{plan.description}</TableCell>
                                        <TableCell>R$ {maskMoney(plan.value)}</TableCell>
                                        <TableCell>{Number(plan.billing_months || 1)} {Number(plan.billing_months || 1) === 1 ? 'mês' : 'meses'}</TableCell>
                                        <TableCell>{moment(plan.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="flex justify-end gap-2">
                                            <EditPlan plan={plan} />
                                            <ActionDelete title={'este plano'} url={'admin.plans.destroy'} param={plan.id} />
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
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <AppPagination data={plans} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
}
