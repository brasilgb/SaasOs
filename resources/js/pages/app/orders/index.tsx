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
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { WhatsAppButton } from '@/components/WhatsAppButtonProps';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { statusServico } from '@/Utils/dataSelect';
import { maskPhone } from '@/Utils/mask';
import { ORDER_STATUSES_READY_FOR_INVOICE } from '@/Utils/order-status';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Barcode, Camera, Edit, FileTextIcon, ImageUp, LinkIcon, Mail, Plus, Wrench, X } from 'lucide-react';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import ModalReceipt from '../receipts/modal-receipt';
import OrderPaymentsModal from './order-payments-modal';

declare global {
    interface Window {
        BarcodeDetector?: new (options?: { formats?: string[] }) => {
            detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
        };
    }
}

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
    const { auth, othersetting } = usePage<{ auth?: { role?: string; permissions?: string[] }; othersetting?: { print_label_button_after_order_create?: boolean } }>().props;
    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
    const barcodeForm = useForm({
        barcode: '',
    });
    const hasActiveFilters = Boolean(search || status || filter);
    const showBarcodeReader = Boolean(othersetting?.print_label_button_after_order_create);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [cameraSupported, setCameraSupported] = useState(false);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const canManageOrders = auth?.role !== 'technician' && auth?.permissions?.includes('orders');
    const feedbackWindowIds = new Set((feedback || []).map((feed: any) => feed.id));

    const handleBudgetFollowUp = (id: number) => {
        router.post(
            route('app.orders.budget-follow-up', id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const communicationLabel = (communication: any) => {
        if (!communication) return '';

        if (communication.action === 'budget_follow_up_sent') {
            return 'follow-up de orçamento';
        }

        return 'cobrança';
    };

    const priorityRowClass = (params: {
        hasPendingPaymentFollowUp: boolean;
        hasBudgetFollowUp: boolean;
        isWarrantyReturn: boolean;
        isFeedbackWindowOpen: boolean;
        hasCustomerFeedback: boolean;
    }) => {
        if (params.hasPendingPaymentFollowUp) return 'bg-rose-100/70 dark:bg-rose-950/25';
        if (params.hasBudgetFollowUp) return 'bg-amber-100/70 dark:bg-amber-950/20';
        if (params.isWarrantyReturn) return 'bg-orange-100/60 dark:bg-orange-950/20';
        if (params.isFeedbackWindowOpen && !params.hasCustomerFeedback) return 'bg-sky-100/70 dark:bg-sky-950/20';

        return '';
    };

    const handleBarcodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const barcode = String(barcodeForm.data.barcode || '').trim();
        if (!barcode) return;

        router.get(
            route('app.orders.index'),
            {
                search: barcode,
                status: status || undefined,
                filter: filter || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const hasCameraApi = 'BarcodeDetector' in window && !!navigator.mediaDevices?.getUserMedia;
        const mobileByViewport = window.matchMedia('(max-width: 768px)').matches;
        const mobileByPointer = window.matchMedia('(pointer: coarse)').matches;
        const mobileByUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent);

        setCameraSupported(hasCameraApi);
        setIsMobileDevice(mobileByViewport || mobileByPointer || mobileByUserAgent);
    }, []);

    useEffect(() => {
        if (!cameraOpen || !cameraSupported) return;

        let animationFrameId = 0;
        let cancelled = false;
        const detector = window.BarcodeDetector
            ? new window.BarcodeDetector({
                  formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e'],
              })
            : null;

        const scan = async () => {
            if (cancelled || !detector || !videoRef.current) return;

            try {
                const barcodes = await detector.detect(videoRef.current);
                const value = barcodes.find((item) => item.rawValue)?.rawValue?.trim();

                if (value) {
                    barcodeForm.setData('barcode', value);
                    setCameraOpen(false);
                    stopCamera();
                    router.get(
                        route('app.orders.index'),
                        {
                            search: value,
                            status: status || undefined,
                            filter: filter || undefined,
                        },
                        {
                            preserveState: true,
                            replace: true,
                        },
                    );
                    return;
                }
            } catch {
                // Ignore intermittent detect errors from the browser scanner loop.
            }

            animationFrameId = window.requestAnimationFrame(scan);
        };

        navigator.mediaDevices
            .getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                },
            })
            .then((stream) => {
                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(() => null);
                }

                animationFrameId = window.requestAnimationFrame(scan);
            })
            .catch(() => {
                setCameraError('Não foi possível acessar a câmera deste dispositivo.');
            });

        return () => {
            cancelled = true;
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }
            stopCamera();
        };
    }, [cameraOpen, cameraSupported, filter, status]);

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
                <div className="flex w-full flex-col gap-2 md:max-w-3xl md:flex-row">
                    <div className="w-full md:max-w-sm">
                        <InputSearch placeholder="Buscar por núm. ordem, cliente ou cpf/cnpj" url="app.orders.index" />
                    </div>
                    {showBarcodeReader && (
                        <form onSubmit={handleBarcodeSubmit} className="w-full md:max-w-xl">
                            <div className="flex gap-2">
                                {isMobileDevice ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setCameraError(null);
                                            setCameraOpen(true);
                                        }}
                                        disabled={!cameraSupported}
                                        title={
                                            cameraSupported
                                                ? 'Ler código de barras com a câmera do celular'
                                                : 'Leitura por câmera indisponível neste navegador'
                                        }
                                        className="w-full md:w-auto"
                                    >
                                        <Camera className="mr-1 h-4 w-4" />
                                        Ler com celular
                                    </Button>
                                ) : (
                                    <div className="relative flex-1">
                                        <Input
                                            value={barcodeForm.data.barcode}
                                            onChange={(e) => barcodeForm.setData('barcode', e.target.value)}
                                            placeholder="Ler com leitor de código de barras"
                                            autoComplete="off"
                                            className="pr-12"
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            className="absolute top-0 right-0 h-full rounded-l-none"
                                            title="Buscar pela leitura do leitor de código de barras"
                                        >
                                            <Barcode className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                {/* Filtro */}
                <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
                    <SelectFilter
                        dataStatus={statusServico}
                        specialFilters={[
                            { value: 'feedback', label: 'Feedback pendente' },
                            { value: 'budget_follow_up', label: 'Orçamento parado' },
                            { value: 'pending_payment_follow_up', label: 'Cobrança pendente' },
                            { value: 'due_48h', label: 'Vencendo hoje e amanhã' },
                            { value: 'financial_open', label: 'Em aberto no financeiro' },
                            { value: 'warranty_return', label: 'Retorno em garantia' },
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
                            <span>App de upload de imagens</span>
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
                                <TableHead>Cliente</TableHead>
                                <TableHead>Equipamento</TableHead>
                                <TableHead>Datas</TableHead>
                                <TableHead>Status</TableHead>
                                {canManageOrders && <TableHead>Feedback</TableHead>}
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.data.length > 0 ? (
                                orders?.data?.map((order: any) => {
                                    const customer = order.customer;
                                    const customerName = customer?.name || 'Cliente não vinculado';
                                    const customerPhone = customer?.phone ? maskPhone(customer.phone) : '-';
                                    const hasCustomerFeedback = Boolean(order.customer_feedback_submitted_at);
                                    const isFeedbackWindowOpen = feedbackWindowIds.has(order.id);
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
                                    const hasBudgetFollowUp = Boolean(order.budget_follow_up);
                                    const hasPendingPaymentFollowUp = Boolean(order.pending_payment_follow_up);
                                    const communicationDaysPending = Number(order.communication_days_pending ?? 0);
                                    const feedbackDaysPending =
                                        !hasCustomerFeedback && order.delivery_date ? Math.max(0, moment().diff(moment(order.delivery_date), 'days')) : 0;
                                    const whatsappContext: 'default' | 'budget_follow_up' | 'pending_payment' = hasPendingPaymentFollowUp
                                        ? 'pending_payment'
                                        : hasBudgetFollowUp
                                          ? 'budget_follow_up'
                                          : 'default';
                                    const rowClassName = priorityRowClass({
                                        hasPendingPaymentFollowUp,
                                        hasBudgetFollowUp,
                                        isWarrantyReturn: Boolean(order.is_warranty_return),
                                        isFeedbackWindowOpen,
                                        hasCustomerFeedback,
                                    });

                                    return (
                                        <TableRow key={order.id} className={rowClassName}>
                                            <TableCell>{order.order_number}</TableCell>
                                            <TableCell className="font-medium">
                                                <div className="space-y-1">
                                                    {customer ? (
                                                        <Link
                                                            className="flex items-center gap-2"
                                                            href={route('app.orders.index', { search: customerName })}
                                                            title={`Ordens do cliente ${customerName}`}
                                                        >
                                                            <Wrench className="h-4 w-4" />
                                                            <span>{customerName}</span>
                                                        </Link>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Wrench className="h-4 w-4" />
                                                            <span>{customerName}</span>
                                                        </div>
                                                    )}
                                                    <div className="text-muted-foreground text-xs">
                                                        {customerPhone}
                                                    </div>
                                                    {order.last_communication?.created_at && (
                                                        <div className="text-muted-foreground text-xs">
                                                            Último contato: {communicationLabel(order.last_communication)}{' '}
                                                            {order.last_communication?.trigger === 'automatic' ? 'automático' : 'manual'}{' '}
                                                            {moment(order.last_communication.created_at).fromNow()}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium">{order.equipment.equipment}</div>
                                                    <div className="text-muted-foreground text-xs">{order.model || 'Modelo não informado'}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Entrada:</span>{' '}
                                                        {moment(order.created_at).format('DD/MM/YYYY')}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Entrega:</span>{' '}
                                                        {order.delivery_date ? moment(order.delivery_date).format('DD/MM/YYYY') : '-'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <StatusBadge category="ordem" value={order.service_status} />
                                                    {hasPendingPaymentFollowUp && (
                                                        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">
                                                            Cobrança pendente
                                                        </Badge>
                                                    )}
                                                    {Boolean(order.is_warranty_return) && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="w-fit bg-amber-100 text-amber-900 hover:bg-amber-100"
                                                        >
                                                            Retorno garantia
                                                        </Badge>
                                                    )}
                                                    {hasBudgetFollowUp && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Badge className="cursor-help bg-yellow-100 text-yellow-900 hover:bg-yellow-100">
                                                                    <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                                                                    Orçamento parado
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Orçamento aguardando retorno há {communicationDaysPending} dias.
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </TableCell>
                                            {canManageOrders && (
                                                <TableCell>
                                                    {hasCustomerFeedback && (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Badge>Avaliado</Badge>
                                                            {order.customer_feedback_rating ? (
                                                                <Badge variant="secondary">Nota {order.customer_feedback_rating}/5</Badge>
                                                            ) : null}
                                                        </div>
                                                    )}

                                                    {!hasCustomerFeedback && isFeedbackWindowOpen && (
                                                        <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100">
                                                            {feedbackDaysPending > 0 ? `Aguardando ${feedbackDaysPending} dias` : 'Aguardando'}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            )}
                                            <TableCell className="flex justify-end gap-2">
                                                {canManageOrders && hasFiscalRegistered && (
                                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                                        NFSe registrada
                                                    </Badge>
                                                )}

                                                {canManageOrders && hasBudgetFollowUp && order.can_send_budget_follow_up && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="outline"
                                                        title="Enviar follow-up de orçamento"
                                                        onClick={() => handleBudgetFollowUp(order.id)}
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
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
                                                    ORDER_STATUSES_READY_FOR_INVOICE.includes(Number(order.service_status)) && (
                                                        <Button
                                                            title="Emitir NFSe"
                                                            onClick={() => {
                                                                setSelectedInvoiceOrder(order);
                                                                setOpenInvoiceModal(true);
                                                            }}
                                                            className="rounded-lg py-2 text-sm font-medium"
                                                        >
                                                            <FileTextIcon className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                {canManageOrders && (
                                                    <WhatsAppButton
                                                        phone={customer?.whatsapp ?? ''}
                                                        customerName={customerName}
                                                        orderNumber={order.order_number}
                                                        status={order.service_status}
                                                        feedback={isFeedbackWindowOpen && !hasCustomerFeedback}
                                                        context={whatsappContext}
                                                        amountDue={remaining}
                                                        daysPending={communicationDaysPending}
                                                        whats={{
                                                            generatedbudget: whats?.generatedbudget,
                                                            servicecompleted: whats?.servicecompleted,
                                                            feedback: whats?.feedback,
                                                            defaultmessage: whats?.defaultmessage,
                                                            budgetfollowup: whats?.budgetfollowup,
                                                            pendingpayment: whats?.pendingpayment,
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
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>

                                                {canManageOrders && <ActionDelete title={'esta ordem'} url={'app.orders.destroy'} param={order.id} />}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={canManageOrders ? 7 : 6} className="flex h-16 w-full items-center justify-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={canManageOrders ? 7 : 6}>
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
            {cameraOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
                    <div className="w-full max-w-md rounded-xl bg-background p-4 shadow-xl">
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Ler código de barras</h3>
                                <p className="text-muted-foreground text-sm">Aponte a câmera para a etiqueta da ordem.</p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setCameraOpen(false);
                                    stopCamera();
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="overflow-hidden rounded-lg border bg-black">
                            <video ref={videoRef} autoPlay playsInline muted className="aspect-[3/4] w-full object-cover" />
                        </div>

                        {cameraError ? <p className="mt-3 text-sm text-rose-600">{cameraError}</p> : null}

                        <div className="mt-3 flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setCameraOpen(false);
                                    stopCamera();
                                }}
                            >
                                Fechar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
