import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react'
import { Edit, PackagePlus, Plus } from 'lucide-react';
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
import CreateBudget from './create-budget';
import EditBudget from './edit-budget';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Orçamentos',
    href: '',
  },
];

export default function CheckList({ budgets }: any) {
  const { flash } = usePage().props as any;

  return (
    <AppLayout>
      <Head title="Orçamentos" />
      {flash.message && <AlertSuccess message={flash.message} />}
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={PackagePlus} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Orçamentos</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div className='w-full'>
          <InputSearch placeholder="Pesquisar por categoria" url="app.budgets.index" />
        </div>
        <div className='w-full flex justify-end'>
          <Button variant={'default'} asChild>
            <Link
              href={route('app.budgets.create')}
            >
              <Plus className='h-4 w-4' />
              <span>Orçamento</span>
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
                <TableHead>Categoria</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Tempo Estimado</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets?.data.length ?
                budgets?.data?.map((budget: any) => (
                  <TableRow key={budget.id}>
                    <TableCell>{budget.budget_number}</TableCell>
                    <TableCell className="font-medium">{budget.service}</TableCell>
                    <TableCell>{budget.estimated_time}</TableCell>
                    <TableCell>{budget.total_value}</TableCell>
                    <TableCell>{moment(budget.created_at).format("DD/MM/YYYY")}</TableCell>
                    <TableCell className='flex justify-end gap-2'>

                      <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Link href={route('app.bugets.edit', budget.id)}>
                          <Edit />
                        </Link>
                      </Button>

                    </TableCell>
                  </TableRow>
                ))
                : (
                  <TableRow>
                    <TableCell colSpan={6} className='h-16 w-full flex items-center justify-center'>
                      Não há dados a serem mostrados no momento.
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6}>
                  <AppPagination data={budgets} />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}
