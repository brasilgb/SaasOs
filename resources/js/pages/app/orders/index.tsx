import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Edit, FileTextIcon, ImageUp, Pencil, Plus, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import moment from 'moment';
import ModalReceipt from '../receipts/modal-receipt';
import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import InputSearch from '@/components/inputSearch';
import SelectFilter from '@/components/SelectFilter';
import { Switch } from '@/components/ui/switch';
import { maskPhone } from '@/Utils/mask';
import { statusServico } from '@/Utils/dataSelect';
import { StatusBadge } from '@/components/StatusBadge';
import { WhatsAppButton } from '@/components/WhatsAppButtonProps';
import { useState } from 'react';
import InvoiceModal from '@/components/Modals/InvoiceModal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/',
    },
    {
        title: 'Ordens',
        href: '/orders',
    },
];

export default function Orders({ orders, whats, feedback }: any) {
    const { ziggy } = usePage().props as any;
    const { cl, init } = (ziggy as any).query
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);

    const handleFeedbackCheck = (value: number, id: number) => {
        const newValue = value === 1 ? 0 : 1;
        router.get(route('app.orders.feedback', { "feedback": newValue, "orderid": id }))
    }
    return (
        <AppLayout>

            <Head title="Ordens" />

            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={Wrench} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Ordens</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">

                {/* Busca */}
                <div className="w-full md:max-w-sm">
                    <InputSearch
                        placeholder="Buscar ordem por número, nome do cliente ou cpf/cnpj"
                        url="app.orders.index"
                    />
                </div>

                {/* Filtro */}
                <div className="w-full md:w-auto">
                    <SelectFilter
                        dataStatus={statusServico}
                        url="app.orders.index"
                    />
                </div>

                {/* Botões */}
                <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:justify-end">

                    <Button variant="default" asChild className="w-full md:w-auto">
                        <a
                            href="/apk/sigmaup-image-upload.apk"
                            download="sigmaup-image-upload.apk"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            <span>APP Upload Images</span>
                        </a>
                    </Button>

                    <Button variant="default" asChild className="w-full md:w-auto">
                        <Link href={route('app.orders.create')}>
                            <Plus className="h-4 w-4 mr-1" />
                            <span>Nova Ordem</span>
                        </Link>
                    </Button>

                </div>

            </div>

            <div className='p-4'>
                <div className='border rounded-lg'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">#</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Recebimento</TableHead>
                                <TableHead>Equipamento</TableHead>
                                <TableHead>Modelo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Entrega</TableHead>
                                <TableHead>Feedback</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.data.length > 0 ?
                                orders?.data?.map((order: any) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.order_number}</TableCell>
                                        <TableCell className="font-medium">
                                            <Link className="flex items-center gap-2" href={route('app.orders.index', { cl: order.customer_id })}
                                                title={`Ordens do cliente ${order.customer.name}`}>
                                                <Wrench className="w-4 h-4" />
                                                <span>{order.customer.name}</span>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="font-medium">{maskPhone(order.customer.phone)}</TableCell>
                                        <TableCell>{moment(order.created_at).format("DD/MM/YYYY")}</TableCell>
                                        <TableCell>{order.equipment.equipment}</TableCell>
                                        <TableCell>{order.model}</TableCell>
                                        <TableCell>
                                            <StatusBadge category="ordem" value={order.service_status} />
                                        </TableCell>
                                        <TableCell>{order.delivery_date ? moment(order.delivery_date).format("DD/MM/YYYY") : ''}</TableCell>
                                        <TableCell>
                                            <Switch
                                                disabled={!feedback?.some((feed: any) => feed.order_number === order.order_number)}
                                                checked={order.feedback}
                                                onCheckedChange={() => handleFeedbackCheck(order.feedback, order.id)}
                                            />
                                        </TableCell>
                                        <TableCell className='flex justify-end gap-2'>
                                            {(order.service_status === 6 || order.service_status === 7) && (

                                                <Button
                                                    title='Emitir Nota Fiscal'
                                                    onClick={() => setOpenInvoiceModal(true)}
                                                    className="py-2 rounded-lg text-sm font-medium"
                                                >
                                                    <FileTextIcon className="h-4 w-4" />
                                                    NFSe
                                                </Button>
                                            )}
                                            <InvoiceModal
                                                open={openInvoiceModal}
                                                onClose={() => setOpenInvoiceModal(false)}
                                                order={order}
                                            />

                                            <WhatsAppButton
                                                phone={order.customer.whatsapp}
                                                customerName={order.customer.name}
                                                orderNumber={order.order_number}
                                                status={order.service_status}
                                                feedback={feedback?.some((feed: any) => feed.order_number === order.order_number)}
                                                whats={{
                                                    generatedbudget: whats?.generatedbudget,
                                                    servicecompleted: whats?.servicecompleted,
                                                    feedback: whats?.feedback,
                                                    tracking_token: order?.tracking_token
                                                }}
                                            />

                                            <ModalReceipt orderid={order.id} />
                                            <Button asChild size="icon" className="bg-fuchsia-700 hover:bg-fuchsia-700 text-white">
                                                <Link href={route('app.images.index', { or: order.id })}>
                                                    <ImageUp className="h-4 w-4" />
                                                </Link>
                                            </Button>

                                            <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                                                <Link href={route('app.orders.edit', order.id)} data={{ page: orders.current_page, cl: cl, init: init ?? init }} >
                                                    <Edit />
                                                </Link>
                                            </Button>

                                            <ActionDelete title={'esta ordem'} url={'app.orders.destroy'} param={order.id} />

                                        </TableCell>
                                    </TableRow>

                                ))
                                : (
                                    <TableRow>
                                        <TableCell colSpan={9} className='h-16 w-full flex items-center justify-center'>
                                            Não há dados a serem mostrados no momento.
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={10}>
                                    <AppPagination data={orders} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    )
}
