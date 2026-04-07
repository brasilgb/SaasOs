import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import InvoiceModal from '@/components/Modals/InvoiceModal';
import SelectFilter from '@/components/SelectFilter';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WhatsAppButton } from '@/components/WhatsAppButtonProps';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { statusServico } from '@/Utils/dataSelect';
import { maskPhone } from '@/Utils/mask';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, FileTextIcon, ImageUp, LinkIcon, Plus, Wrench, X } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import ModalReceipt from '../receipts/modal-receipt';
import OrderPaymentsModal from './order-payments-modal';

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

export default function Orders({ orders, whats, feedback, search, status, filter }: any) {
    const { auth } = usePage<{ auth?: { role?: string; permissions?: string[] } }>().props;
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
    const hasActiveFilters = Boolean(search || status || filter);
    const canManageOrders = auth?.role !== 'technician' && auth?.permissions?.includes('orders');
    const feedbackWindowIds = new Set((feedback || []).map((feed: any) => feed.id));

    const handleFeedbackCheck = (id: number) => {
        router.patch(
            route('app.orders.feedback', id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Ordens" />

            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Wrench} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Ordens</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                {/* Busca */}
                <div className="w-full md:max-w-sm">
                    <InputSearch placeholder="Buscar por número da ordem, cliente ou cpf/cnpj" url="app.orders.index" />
                </div>

                {/* Filtro */}
                <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
                    <SelectFilter
                        dataStatus={statusServico}
                        specialFilters={[
                            { value: 'feedback', label: 'Listar Feedback' },
                            { value: 'due_48h', label: 'Vencendo hoje e amanha' },
                            { value: 'financial_open', label: 'Em aberto financeiramente' },
                        ]}
                        url="app.orders.index"
                    />
                    {hasActiveFilters && (
                        <Button variant="outline" asChild>
                            <Link href={route('app.orders.index')}>
                                <X className="mr-1 h-4 w-4" />
                                Limpar filtro
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Botões */}
                <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:justify-end">
                    <Button variant="default" asChild className="w-full md:w-auto">
                        <a href="/apk/sigmaup-image-upload.apk" download="sigmaup-image-upload.apk">
                            <Plus className="mr-1 h-4 w-4" />
                            <span>APP Upload Images</span>
                        </a>
                    </Button>

                    {canManageOrders && (
                        <Button variant="default" asChild className="w-full md:w-auto">
                            <Link href={route('app.orders.create')}>
                                <Plus className="mr-1 h-4 w-4" />
                                <span>Nova Ordem</span>
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
                                <TableHead>Telefone</TableHead>
                                <TableHead>Recebimento</TableHead>
                                <TableHead>Equipamento</TableHead>
                                <TableHead>Modelo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Entrega</TableHead>
                                {canManageOrders && <TableHead>Feedback</TableHead>}
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.data.length > 0 ? (
                                orders?.data?.map((order: any) => {
                                    const isFeedbackDone = order.feedback === 1 || order.feedback === true;
                                    const isFeedbackWindowOpen = feedbackWindowIds.has(order.id);
                                    const isDelivered = Number(order.service_status) === 10;
                                    const isFeedbackExpired = isDelivered && !isFeedbackDone && !isFeedbackWindowOpen;
                                    const totalOrder = Number(order.service_cost ?? 0);
                                    const totalPaid = Number(order.total_paid ?? 0);
                                    const remaining = Math.max(0, totalOrder - totalPaid);
                                    const hasFinancialValuesFilled =
                                        order.parts_value !== null &&
                                        order.parts_value !== '' &&
                                        order.service_value !== null &&
                                        order.service_value !== '' &&
                                        totalOrder > 0;
                                    const hasPendingPayment = remaining > 0.009;
                                    const hasFiscalRegistered = Boolean(order?.fiscal_document_number || order?.fiscal_document_url);

                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.order_number}</TableCell>
                                            <TableCell className="font-medium">
                                                <Link
                                                    className="flex items-center gap-2"
                                                    href={route('app.orders.index', { search: order.customer.name })}
                                                    title={`Ordens do cliente ${order.customer.name}`}
                                                >
                                                    <Wrench className="h-4 w-4" />
                                                    <span>{order.customer.name}</span>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="font-medium">{maskPhone(order.customer.phone)}</TableCell>
                                            <TableCell>{moment(order.created_at).format('DD/MM/YYYY')}</TableCell>
                                            <TableCell>{order.equipment.equipment}</TableCell>
                                            <TableCell>{order.model}</TableCell>
                                            <TableCell>
                                                <StatusBadge category="ordem" value={order.service_status} />
                                            </TableCell>
                                            <TableCell>{order.delivery_date ? moment(order.delivery_date).format('DD/MM/YYYY') : ''}</TableCell>
                                            {canManageOrders && (
                                                <TableCell>
                                                    {isFeedbackDone && <Badge>OK</Badge>}

                                                    {!isFeedbackDone && isFeedbackWindowOpen && (
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="secondary">Pendente</Badge>
                                                            <Switch
                                                                checked={false}
                                                                onCheckedChange={(checked) => checked && handleFeedbackCheck(order.id)}
                                                            />
                                                        </div>
                                                    )}

                                                    {isFeedbackExpired && <Badge variant="outline">Fora da janela</Badge>}
                                                </TableCell>
                                            )}
                                            <TableCell className="flex justify-end gap-2">
                                                {canManageOrders && hasFiscalRegistered && (
                                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                                        NFSe registrada
                                                    </Badge>
                                                )}

                                                {canManageOrders && hasFinancialValuesFilled && hasPendingPayment && (
                                                    <OrderPaymentsModal
                                                        order={order}
                                                        orderPayments={[]}
                                                        paymentSummary={null}
                                                        compactTrigger
                                                        compactTriggerClassName="bg-rose-600 text-white hover:bg-rose-700"
                                                        compactTriggerTitle="Pagamento pendente"
                                                    />
                                                )}

                                                {canManageOrders && (
                                                    <Button asChild>
                                                        <a
                                                            target="_blank"
                                                            href={route('os.token', order?.tracking_token)}
                                                            title="Link para o cliente sobre a ordem de serviço"
                                                            className="bg-solar-blue-primary hover:bg-solar-blue-primary/90 text-white"
                                                        >
                                                            <LinkIcon className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                                {canManageOrders &&
                                                    (order.service_status === 6 || order.service_status === 7 || order.service_status === 8) && (
                                                        <Button
                                                            title="Emitir Nota Fiscal"
                                                            onClick={() => {
                                                                setSelectedInvoiceOrder(order);
                                                                setOpenInvoiceModal(true);
                                                            }}
                                                            className="rounded-lg py-2 text-sm font-medium"
                                                        >
                                                            <FileTextIcon className="h-4 w-4" />
                                                            NFSe
                                                        </Button>
                                                    )}

                                                {canManageOrders && (
                                                    <WhatsAppButton
                                                        phone={order.customer.whatsapp}
                                                        customerName={order.customer.name}
                                                        orderNumber={order.order_number}
                                                        status={order.service_status}
                                                        feedback={isFeedbackWindowOpen}
                                                        whats={{
                                                            generatedbudget: whats?.generatedbudget,
                                                            servicecompleted: whats?.servicecompleted,
                                                            feedback: whats?.feedback,
                                                            defaultmessage: whats?.defaultmessage,
                                                            tracking_token: order?.tracking_token,
                                                        }}
                                                    />
                                                )}

                                                {canManageOrders && <ModalReceipt orderid={order.id} />}
                                                <Button asChild size="icon" className="bg-fuchsia-700 text-white hover:bg-fuchsia-700">
                                                    <Link href={route('app.images.index', { or: order.id })}>
                                                        <ImageUp className="h-4 w-4" />
                                                    </Link>
                                                </Button>

                                                <Button asChild size="icon" className="bg-orange-500 text-white hover:bg-orange-600">
                                                    <Link
                                                        href={route('app.orders.edit', order.id)}
                                                        data={{ page: orders.current_page, search: search }}
                                                    >
                                                        <Edit />
                                                    </Link>
                                                </Button>

                                                {canManageOrders && <ActionDelete title={'esta ordem'} url={'app.orders.destroy'} param={order.id} />}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={canManageOrders ? 10 : 9} className="flex h-16 w-full items-center justify-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={canManageOrders ? 10 : 9}>
                                    <AppPagination data={orders} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
            {selectedInvoiceOrder && (
                <InvoiceModal
                    open={openInvoiceModal}
                    onClose={() => {
                        setOpenInvoiceModal(false);
                        setSelectedInvoiceOrder(null);
                    }}
                    order={selectedInvoiceOrder}
                />
            )}
        </AppLayout>
    );
}
