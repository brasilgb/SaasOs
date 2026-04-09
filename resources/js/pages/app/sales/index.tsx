import ActionCancelSale from '@/components/action-cancel-sale';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import SaleReceiptPDF from '@/components/SaleReceiptPDF';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { pdf } from '@react-pdf/renderer';
import { EyeIcon, FileText, Loader2, PrinterIcon, ShoppingCartIcon } from 'lucide-react';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import SaleDetailsModal from './app-sale-details-modal';
import Receipt from './receipt';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Vendas',
        href: '#',
    },
];

export default function Sales({ sales, search, financial_status, financial_counts }: any) {
    const { auth } = usePage().props as any;
    const companyData = auth?.user?.tenant;
    const acessDenied = auth?.user?.roles === 9 || auth?.user?.roles === 1 ? true : false;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [saleToPrint, setSaleToPrint] = useState<any>(null);
    const receiptRef = useRef<HTMLDivElement>(null);
    const [generatingPdfSaleId, setGeneratingPdfSaleId] = useState<number | null>(null);
    const [printingThermalSaleId, setPrintingThermalSaleId] = useState<number | null>(null);

    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        onAfterPrint: () => {
            setSaleToPrint(null);
            setPrintingThermalSaleId(null);
        },
    });

    useEffect(() => {
        if (saleToPrint) {
            handlePrint();
        }
    }, [saleToPrint]);

    const handleViewDetails = (sale: any) => {
        setSelectedSale(sale);
        setIsModalOpen(true);
    };

    const handlePrintReceipt = (sale: any) => {
        setPrintingThermalSaleId(sale.id);
        const mappedSale = {
            ...sale,
            items: sale.items.map((item: any) => ({
                name: item.part?.name || item.name || 'Produto',
                selected_quantity: item.quantity,
                sale_price: item.unit_price,
            })),
        };
        setSaleToPrint(mappedSale);
    };

    const handleGeneratePDF = async (sale: any) => {
        if (!sale) return;

        setGeneratingPdfSaleId(sale.id);
        const previewWindow = window.open('', '_blank');

        if (!previewWindow) {
            setGeneratingPdfSaleId(null);
            return;
        }

        previewWindow.document.title = 'Gerando recibo...';
        previewWindow.document.body.innerHTML = '<p style="font-family: Arial, sans-serif; padding: 16px;">Gerando recibo PDF...</p>';

        try {
            const customerNameForPDF = sale.customer?.name || 'Consumidor Final';

            const mappedItems = sale.items.map((item: any) => ({
                name: item.part?.name || item.name || 'Produto',
                selected_quantity: item.quantity,
                sale_price: item.unit_price,
            }));

            // Gera o blob do PDF
            const blob = await pdf(
                <SaleReceiptPDF items={mappedItems} total={sale.total_amount} customerName={customerNameForPDF} sale={sale} company={companyData} />,
            ).toBlob();

            const url = URL.createObjectURL(blob);
            previewWindow.location.href = url;
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (error) {
            previewWindow.close();
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar o PDF.');
        } finally {
            setGeneratingPdfSaleId(null);
        }
    };

    return (
        <AppLayout>
            <SaleDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} sale={selectedSale} />
            <div style={{ display: 'none' }}>
                <Receipt
                    ref={receiptRef}
                    paper="80mm"
                    items={saleToPrint?.items || []}
                    total={new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                        saleToPrint?.total_amount || 0,
                    )}
                    customer={saleToPrint?.customer?.name || 'Consumidor'}
                    sale={saleToPrint}
                />
            </div>
            <Head title="Vendas" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={ShoppingCartIcon} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Vendas</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full">
                    <InputSearch placeholder="Buscar vendas por número e cliente" url="app.sales.index" />
                </div>
                <div className="flex w-full flex-wrap justify-end gap-2">
                    <Button variant={financial_status === 'paid' ? 'default' : 'outline'} asChild>
                        <Link href={route('app.sales.index', { search, financial_status: 'paid' })}>Pago ({financial_counts?.paid ?? 0})</Link>
                    </Button>
                    <Button variant={financial_status === 'partial' ? 'default' : 'outline'} asChild>
                        <Link href={route('app.sales.index', { search, financial_status: 'partial' })}>
                            Parcial ({financial_counts?.partial ?? 0})
                        </Link>
                    </Button>
                    <Button variant={financial_status === 'pending' ? 'default' : 'outline'} asChild>
                        <Link href={route('app.sales.index', { search, financial_status: 'pending' })}>
                            Pendente ({financial_counts?.pending ?? 0})
                        </Link>
                    </Button>
                    <Button variant={financial_status === 'cancelled' ? 'default' : 'outline'} asChild>
                        <Link href={route('app.sales.index', { search, financial_status: 'cancelled' })}>
                            Cancelada ({financial_counts?.cancelled ?? 0})
                        </Link>
                    </Button>
                    {financial_status && (
                        <Button variant="ghost" asChild>
                            <Link href={route('app.sales.index', { search })}>Limpar filtro</Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Pagamento</TableHead>
                                <TableHead>Financeiro</TableHead>
                                <TableHead>Data venda</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales?.data.length > 0 ? (
                                sales?.data?.map((sale: any) => {
                                    const isGeneratingCurrentPdf = generatingPdfSaleId === sale.id;
                                    const isPrintingCurrentThermal = printingThermalSaleId === sale.id;

                                    return (
                                        <TableRow key={sale.id}>
                                            <TableCell>{sale.sales_number}</TableCell>
                                            <TableCell>{sale.customer?.name || 'Cliente não informado'}</TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_amount)}
                                            </TableCell>
                                            <TableCell className="capitalize">{sale.payment_method || 'não informado'}</TableCell>
                                            <TableCell>
                                                {sale.financial_status === 'paid' && <Badge>Pago</Badge>}
                                                {sale.financial_status === 'partial' && <Badge variant="secondary">Parcial</Badge>}
                                                {sale.financial_status === 'pending' && <Badge variant="destructive">Pendente</Badge>}
                                                {sale.financial_status === 'cancelled' && <Badge variant="outline">Cancelada</Badge>}
                                            </TableCell>
                                            <TableCell>{moment(sale.created_at).format('DD/MM/YYYY')}</TableCell>
                                            <TableCell className="flex justify-end gap-2">
                                                {sale.status === 'completed' && <ActionCancelSale saleId={sale.id} disabled={acessDenied} />}

                                                {sale.status === 'cancelled' && <Badge variant="destructive">Cancelada</Badge>}

                                                <Button
                                                    type="button"
                                                    onClick={() => handleGeneratePDF(sale)}
                                                    disabled={isGeneratingCurrentPdf || isPrintingCurrentThermal}
                                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                                >
                                                    {isGeneratingCurrentPdf ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
                                                    Recibo PDF
                                                </Button>

                                                <Button
                                                    onClick={() => handlePrintReceipt(sale)}
                                                    size="icon"
                                                    className="bg-blue-600 text-white hover:bg-blue-500"
                                                    title="Imprimir Recibo"
                                                    disabled={isGeneratingCurrentPdf || isPrintingCurrentThermal}
                                                >
                                                    {isPrintingCurrentThermal ? <Loader2 className="h-4 w-4 animate-spin" /> : <PrinterIcon className="h-4 w-4" />}
                                                </Button>

                                                <Button
                                                    onClick={() => handleViewDetails(sale)}
                                                    size="icon"
                                                    className="bg-orange-500 text-white hover:bg-orange-600"
                                                    title="Ver Detalhes"
                                                    disabled={isGeneratingCurrentPdf || isPrintingCurrentThermal}
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
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
                                    <AppPagination data={sales} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
