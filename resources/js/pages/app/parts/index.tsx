import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react'
import { Edit, MemoryStick, Plus } from 'lucide-react';
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
import ActionDelete from '@/components/action-delete';
import AlertSuccess from '@/components/app-alert-success';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Peças',
    href: "#",
  },
];

export default function Parts({ parts }: any) {
  const { flash } = usePage().props as any;

  return (
    <AppLayout>
      <Head title="Peças" />
      {flash.message && <AlertSuccess message={flash.message} />}
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={MemoryStick} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Peças</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>
      <div className='flex items-center justify-between p-4'>
        <div className='w-full'>
          <InputSearch placeholder="Buscar peça por nome e part number" url="app.parts.index" />
        </div>
        <div className='w-full flex justify-end'>
          <Button variant={'default'} asChild>
            <Link
              href={route('app.parts.create')}
            >
              <Plus className='h-4 w-4' />
              <span>Peça</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className='p-4'>
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-max">Part Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Fabricante</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Em estoque</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts?.data.length ?
                parts?.data?.map((part: any) => (
                  <TableRow key={part.id}>
                    <TableCell>{part.part_number}</TableCell>
                    <TableCell className="font-medium">{part.name}</TableCell>
                    <TableCell>{part.manufacturer}</TableCell>
                    <TableCell>{part.sale_price}</TableCell>
                    <TableCell>{part.stock_quantity}</TableCell>
                    <TableCell>{moment(part.created_at).format("DD/MM/YYYY")}</TableCell>
                    
                    <TableCell className='flex justify-end gap-2'>
                      
                      <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Link href={route('app.parts.edit', part.id)}>
                          <Edit />
                        </Link>
                      </Button>

                      <ActionDelete title={'esta peça'} url={'app.parts.destroy'} param={part.id} />

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
                <TableCell colSpan={8}>
                  <AppPagination data={parts} />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}
