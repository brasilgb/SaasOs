import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react'
import { ImageUp, Pencil, Plus, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AlertSuccess from '@/components/app-alert-success';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import moment from 'moment';
import { statusOrdemByValue } from '@/Utils/functions';
import ModalReceipt from '../receipts/modal-receipt';
import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import InputSearch from '@/components/inputSearch';
import { Badge } from '@/components/ui/badge';

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

export default function Orders({ orders, whats }: any) {
  const { flash, ziggy } = usePage().props as any;
  const { oc } = (ziggy as any).query
  return (
    <AppLayout>
      {flash.message && <AlertSuccess message={flash.message} />}
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

      <div className='flex items-center justify-between p-4'>
        <div>
          <InputSearch placeholder="Buscar ordem" url="orders.index" />
        </div>
        <div>
          <Button variant={'default'} asChild>
            <Link
              href={route('orders.create')}
            >
              <Plus className='h-4 w-4' />
              <span>Ordem</span>
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
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.data.length > 0 ?
                orders?.data?.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell className="font-medium">
                      <Link className="flex items-center gap-2" href={`/orders?oc=${order.id}`}
                        title={`Ordens do cliente ${order.customer.name}`}>
                        <Wrench className="w-4 h-4" />
                        <span>{order.customer.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{order.customer.phone}</TableCell>
                    <TableCell>{moment(order.created_at).format("DD/MM/YYYY")}</TableCell>
                    <TableCell>{order.equipment.equipment}</TableCell>
                    <TableCell>{order.model}</TableCell>
                    <TableCell>{<Badge variant={'default'}>{statusOrdemByValue(order.service_status)}</Badge>}</TableCell>
                    <TableCell>{order.delivery_date ? moment(order.delivery_date).format("DD/MM/YYYY") : ''}</TableCell>
                    <TableCell className='flex justify-end gap-2'>

                      <Button asChild size="icon" className="bg-green-500 hover:bg-green-500 text-white">
                        <a target='_blank' href={`https://wa.me/${order.customer.whatsapp}?text=${encodeURIComponent(order.service_status == 6 ? whats?.servicecompleted : order.service_status == 3 ? whats?.generatedbudget : "Olá, cliente!")}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                          </svg>
                        </a>
                      </Button>

                      <ModalReceipt orderid={order.id} />
                      <Button asChild size="icon" className="bg-fuchsia-700 hover:bg-fuchsia-700 text-white">
                        <Link href={`/images?or=${order.id}`}>
                          <ImageUp className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Link href={`/orders/${order.id}`} data={{ page: orders.current_page, oc: oc }} >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>

                      <ActionDelete title={'esta ordem'} url={'orders.destroy'} param={order.id} />
                      
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
                  <TableCell colSpan={9}>
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
