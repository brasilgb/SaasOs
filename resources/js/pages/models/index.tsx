import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react'
import { PackagePlus, Pencil, Plus } from 'lucide-react';
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
import EditModel from './edit-model';
import CreateModel from './create-model';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/',
  },
  {
    title: 'Models',
    href: '/models',
  },
];

export default function Models({ models, brands }: any) {
  const { flash } = usePage().props as any;

  return (
    <AppLayout>
      <Head title="Modelos" />
      {flash.message && <AlertSuccess message={flash.message} />}
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={PackagePlus} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Modelos</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>
      <div className='flex items-center justify-between p-4'>
        <div>
          <InputSearch placeholder="Buscar modelo" url="register-models.index" />
        </div>
        <div>
          <CreateModel brands={brands} />
        </div>
      </div>

      <div className='p-4'>
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models?.data.length ?
                models?.data?.map((model: any) => (
                  <TableRow key={model.id}>
                    <TableCell>{model.id}</TableCell>
                    <TableCell className="font-medium">{model.brand.brand}</TableCell>
                    <TableCell className="font-medium">{model.model}</TableCell>
                    <TableCell>{moment(model.created_at).format("DD/MM/YYYY")}</TableCell>
                    <TableCell className='flex justify-end gap-2'>
                      <EditModel model={model} brands={brands} />
                      <ActionDelete title={'este modelo'} url={'register-models.destroy'} param={model.id} />
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
                    <AppPagination data={models} />
                  </TableCell>
                </TableRow>
              </TableFooter>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}
