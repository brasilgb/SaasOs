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
import { Button } from '@/components/ui/button';
import InputSearch from '@/components/inputSearch';
import AppPagination from '@/components/app-pagination';
import ActionDelete from '@/components/action-delete';
import AlertSuccess from '@/components/app-alert-success';
import CadastraMarca from './create-brand';
import EditBrand from './edit-brand';
import CreateBrand from './create-brand';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/',
  },
  {
    title: 'Marcas',
    href: '/brands',
  },
];

export default function Brands({ brands }: any) {
  const { flash } = usePage().props as any;

  return (
    <AppLayout>
      <Head title="Marcas" />
      {flash.message && <AlertSuccess message={flash.message} />}
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={PackagePlus} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Marcas</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>
      <div className='flex items-center justify-between p-4'>
        <div>
          <InputSearch placeholder="Buscar marca" url="register-brands.index" />
        </div>
        <div>
          <CreateBrand />
        </div>
      </div>

      <div className='p-4'>
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands?.data.length ?
                brands?.data?.map((brand: any) => (
                  <TableRow key={brand.id}>
                    <TableCell>{brand.id}</TableCell>
                    <TableCell className="font-medium">{brand.brand}</TableCell>
                    <TableCell>{moment(brand.created_at).format("DD/MM/YYYY")}</TableCell>
                    <TableCell className='flex justify-end gap-2'>
                      <EditBrand brand={brand} />
                      <ActionDelete title={'esta marca'} url={'register-brands.destroy'} param={brand.id} />

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
                    <AppPagination data={brands} />
                  </TableCell>
                </TableRow>
              </TableFooter>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}
