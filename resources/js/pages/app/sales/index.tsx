import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react'
import { EyeIcon, ShoppingCartIcon, PrinterIcon, Loader2, FileText } from 'lucide-react';
import moment from 'moment'
import { useState, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import InputSearch from '@/components/inputSearch';
import AppPagination from '@/components/app-pagination';
import { Button } from '@/components/ui/button';
import SaleDetailsModal from './app-sale-details-modal';
import ActionCancelSale from '@/components/action-cancel-sale';
import { Badge } from '@/components/ui/badge';
import { useReactToPrint } from 'react-to-print';
import Receipt from './receipt';
import { pdf } from '@react-pdf/renderer';
import SaleReceiptPDF from '@/components/SaleReceiptPDF';
import axios from 'axios';

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

export default function Sales({ sales }: any) {
  const { auth } = usePage().props as any;
  const companyData = auth?.user?.tenant;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleToPrint, setSaleToPrint] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPrintingThermal, setIsPrintingThermal] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    onAfterPrint: () => setSaleToPrint(null),
  });

  useEffect(() => {
    if (saleToPrint) {
      handlePrint();
    }
  }, [saleToPrint]);

  const handleViewDetails = (sale: any) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  }

  const handlePrintReceipt = (sale: any) => {
    setIsPrintingThermal(true);
    const mappedSale = {
      ...sale,
      items: sale.items.map((item: any) => ({
        name: item.part?.name || item.name || 'Produto',
        selected_quantity: item.quantity,
        sale_price: item.unit_price
      }))
    };
    setSaleToPrint(mappedSale);
    setIsPrintingThermal(false);
  }

  const handleGeneratePDF = async (sale: any) => {
    if (!sale) return;

    setIsGeneratingPdf(true);
    try {
      const customerNameForPDF = sale.customer?.name || 'Consumidor Final';

      const mappedItems = sale.items.map((item: any) => ({
        name: item.part?.name || item.name || 'Produto',
        selected_quantity: item.quantity,
        sale_price: item.unit_price
      }));

      // Gera o blob do PDF
      const blob = await pdf(
        <SaleReceiptPDF
          items={mappedItems}
          total={sale.total_amount}
          customerName={customerNameForPDF}
          sale={sale}
          company={companyData}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank"); // Abre em nova aba para imprimir
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o PDF.");
    } finally {
      setIsGeneratingPdf(false);
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
          total={new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(saleToPrint?.total_amount || 0)}
          customer={saleToPrint?.customer?.name || 'Consumidor'}
          sale={saleToPrint}
        />
      </div>
      <Head title="Vendas" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={ShoppingCartIcon} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Vendas</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div className='w-full'>
          <InputSearch placeholder="Buscar vendas por número e cliente" url="app.sales.index" />
        </div>
        <div className='w-full flex justify-end'>

        </div>
      </div>

      <div className='p-4'>
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Data venda</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales?.data.length > 0 ?
                sales?.data?.map((sale: any) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.sales_number}</TableCell>
                    <TableCell>{sale.customer?.name || 'Cliente não informado'}</TableCell>
                    <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_amount)}</TableCell>
                    <TableCell>{moment(sale.created_at).format("DD/MM/YYYY")}</TableCell>
                    <TableCell className='flex justify-end gap-2'>

                      {sale.status === 'completed' && (
                        <ActionCancelSale saleId={sale.id} />
                      )}

                      {sale.status === 'cancelled' && (
                        <Badge variant="destructive">
                          Cancelada
                        </Badge>
                      )}

                      <Button
                        type="button"
                        onClick={() => handleGeneratePDF(sale)}
                        disabled={isPrintingThermal || isGeneratingPdf}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isGeneratingPdf ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <FileText className="size-4" />
                        )}
                        Recibo PDF
                      </Button>

                      <Button onClick={() => handlePrintReceipt(sale)} size="icon" className="bg-blue-600 hover:bg-blue-500 text-white" title="Imprimir Recibo">
                        <PrinterIcon className="h-4 w-4" />
                      </Button>

                      <Button onClick={() => handleViewDetails(sale)} size="icon" className="bg-orange-500 hover:bg-orange-600 text-white" title="Ver Detalhes">
                        <EyeIcon className="h-4 w-4" />
                      </Button>

                    </TableCell>
                  </TableRow>
                ))
                : (
                  <TableRow>
                    <TableCell colSpan={5} className='h-16 w-full flex items-center justify-center'>
                      Não há dados a serem mostrados no momento.
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>
                  <AppPagination data={sales} />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}
