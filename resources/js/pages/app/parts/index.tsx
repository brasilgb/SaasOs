import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head, Link } from '@inertiajs/react';
import { Check, Edit, MemoryStick, Plus, X } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Peças/Produtos',
        href: '#',
    },
];

export default function Parts({ parts, search }: any) {
    return (
        <AppLayout>
            <Head title="Peças" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={MemoryStick} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Peças/Produtos</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full">
                    <InputSearch placeholder="Buscar peça/produto por nome e número" url="app.parts.index" />
                </div>
                <div className="flex w-full justify-end">
                    <Button variant={'default'} asChild>
                        <Link href={route('app.parts.create')} className="w-full md:w-auto">
                            <Plus className="h-4 w-4" />
                            <span>Nova Peça/Produto</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-max">#</TableHead>
                                <TableHead className="min-w-max">N° Peça/Produto</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Vendável</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Est. mínimo</TableHead>
                                <TableHead>Estoque</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parts?.data.length ? (
                                parts?.data?.map((part: any) => (
                                    <TableRow key={part.id}>
                                        <TableCell>{part.part_number}</TableCell>
                                        <TableCell>{part.reference_number}</TableCell>
                                        <TableCell>{part.type === 'part' ? 'Peça' : 'Produto'}</TableCell>
                                        <TableCell>
                                            <span>
                                                {part.is_sellable ? (
                                                    <Check className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <X className="h-4 w-4 text-gray-400" />
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell>{part.category}</TableCell>
                                        <TableCell className="font-medium">{part.name}</TableCell>
                                        <TableCell>{maskMoney(part.sale_price)}</TableCell>
                                        <TableCell>{part.minimum_stock_level}</TableCell>
                                        <TableCell>
                                            {part.quantity <= part.minimum_stock_level ? (
                                                <Badge variant={'destructive'}>{part.quantity}</Badge>
                                            ) : (
                                                <Badge variant={'default'}>{part.quantity}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{moment(part.created_at).format('DD/MM/YYYY')}</TableCell>

                                        <TableCell className="flex justify-end gap-2">
                                            <Button asChild size="icon" className="bg-orange-500 text-white hover:bg-orange-600">
                                                <Link href={route('app.parts.edit', part.id)} data={{ page: parts.current_page, search: search }}>
                                                    <Edit />
                                                </Link>
                                            </Button>

                                            <ActionDelete title={'esta peça'} url={'app.parts.destroy'} param={part.id} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11} className="flex h-16 w-full items-center justify-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={11}>
                                    <AppPagination data={parts} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
