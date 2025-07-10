import AdminLayout from '@/layouts/admin/admin-layout'
import { Head, Link } from '@inertiajs/react'
import { BreadcrumbItem } from '@/types';
import { Building, Building2, Edit, HandCoins, Plus } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import moment from 'moment';
import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Planos',
        href: "#",
    },
];

export default function PlansIndex({ plans }: any) {
    return (
        <AdminLayout>
            <Head title="Planos" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={HandCoins} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Planos</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className='flex items-center justify-between p-4'>
                <div>
                    <InputSearch placeholder="Buscar plano" url="admin.plans.index" />
                </div>
                <div>
                    <Button variant="default" asChild>
                        <Link href={route('admin.plans.create')}>
                            <Plus />
                            Plano
                        </Link>
                    </Button>
                </div>
            </div>

            <div className='p-4'>
                <div className='border rounded-lg'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Periodo</TableHead>
                                <TableHead>Método de pagamento</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans?.data.length > 0 ?
                                plans?.data?.map((plan: any) => (
                                    <TableRow key={plan.id}>
                                        <TableCell>{plan.id}</TableCell>
                                        <TableCell>{plan.name}</TableCell>
                                        <TableCell>{plan.price}</TableCell>
                                        <TableCell>{plan.period}</TableCell>
                                        <TableCell>{plan.paiment_method}</TableCell>
                                        <TableCell>{moment(plan.created_at).format("DD/MM/YYYY")}</TableCell>
                                        <TableCell className='flex justify-end gap-2'>

                                            <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                                                <Link href={route('admin.plans.edit', plan.id)}>
                                                    <Edit />
                                                </Link>
                                            </Button>

                                            <ActionDelete title={'este cliente'} url={'admin.plans.destroy'} param={plan.id} />

                                        </TableCell>
                                    </TableRow>
                                ))
                                : (
                                    <TableRow>
                                        <TableCell colSpan={7} className='h-16 w-full flex items-center justify-center'>
                                            Não há dados a serem mostrados no momento.
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={7} >
                                    <AppPagination data={plans} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>

        </AdminLayout>
    )
}
