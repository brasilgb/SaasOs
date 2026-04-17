import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head, Link } from '@inertiajs/react';
import { Edit, PackagePlus, Plus } from 'lucide-react';
import moment from 'moment';
import { PrintBudget } from './print-buget';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Orçamentos',
        href: '',
    },
];

export default function CheckList({ budgets, company, search }: any) {
    return (
        <AppLayout>
            <Head title="Orçamentos" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={PackagePlus} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Orçamentos</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full">
                    <InputSearch placeholder="Pesquisar por por serviço" url="app.budgets.index" />
                </div>
                <div className="w-full bg-accent text-accent-foreground rounded-md p-2 text-xs font-medium text-center">
                    Os dados da empresa devem estar preenchidos para exibir corretamente o orçamento
                </div>
                <div className="flex w-auto justify-end">
                    <Button variant={'default'} asChild>
                        <Link className="w-full md:w-auto" href={route('app.budgets.create')}>
                            <Plus className="h-4 w-4" />
                            <span>Novo Orçamento</span>
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
                                <TableHead>Equipamento</TableHead>
                                <TableHead>Serviço</TableHead>
                                <TableHead>Condições</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {budgets?.data.length ? (
                                budgets?.data?.map((budget: any) => (
                                    <TableRow key={budget.id}>
                                        <TableCell>{budget.budget_number}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{budget.equipment.equipment}</div>
                                                <div className="text-muted-foreground text-xs">{budget.model || 'Modelo não informado'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{budget.service}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Tempo:</span> {budget.estimated_time || '-'} ·{' '}
                                                <span className="text-muted-foreground">Garantia:</span> {budget.warranty || '-'} ·{' '}
                                                <span className="text-muted-foreground">Validade:</span> {budget.validity ? `${budget.validity} dias` : '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell>R$ {maskMoney(budget.total_value)}</TableCell>
                                        <TableCell>{moment(budget.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="flex justify-end gap-2">
                                            <PrintBudget company={company} budget={budget} />
                                            <Button asChild size="icon" className="bg-orange-500 text-white hover:bg-orange-600">
                                                <Link
                                                    href={route('app.budgets.edit', budget.id)}
                                                    data={{ page: budgets.current_page, search: search }}
                                                >
                                                    <Edit />
                                                </Link>
                                            </Button>

                                            <ActionDelete title={'este orçamento'} url={'app.budgets.destroy'} param={budget.id} />
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
                                    <AppPagination data={budgets} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
