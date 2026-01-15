import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react'
import { EyeIcon, ShoppingCartIcon } from 'lucide-react';
import moment from 'moment'
import { useState } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const handleViewDetails = (sale: any) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  }

  return (
    <AppLayout>
      <SaleDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} sale={selectedSale} />
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

                      <Button onClick={() => handleViewDetails(sale)} size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
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
