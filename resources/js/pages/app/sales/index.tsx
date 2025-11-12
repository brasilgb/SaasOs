import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react'
import { ShoppingCartIcon } from 'lucide-react';
import moment from 'moment'
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
import AlertSuccess from '@/components/app-alert-success';
import ActionDelete from '@/components/action-delete';

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
  const { flash } = usePage().props as any;

  return (
    <AppLayout>
      <Head title="Vendas" />
      {flash.message && <AlertSuccess message={flash.message} />}
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
          <InputSearch placeholder="Buscar vendas" url="app.sales.index" />
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

{/* 
                      <Button asChild size="icon" className="bg-green-500 hover:bg-green-500 text-white">
                        <a target='_blank' href={`https://wa.me/${sale.user.whatsapp}?text=${sale.service} - ${sale.customer.street}, ${sale.customer.number}, ${sale.customer.complement}, ${sale.customer.district}, ${sale.customer.city} - ${sale.customer.uf}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                          </svg>
                        </a>
                      </Button>

                      <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Link href={route("app.sales.edit", sale.id)}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
 */}
                      <ActionDelete title={'esta venda'} url={'app.sales.destroy'} param={sale.id} />

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
