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
import CreateEquipment from './create-equipment';
import EditEquipment from './edit-equipment';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/',
  },
  {
    title: 'Equipamentos',
    href: '/equipments',
  },
];

export default function Equipment({ equipments }: any) {
  const { flash } = usePage().props as any;

  return (
    <AppLayout>
      <Head title="Equipamentos" />
      {flash.message && <AlertSuccess message={flash.message} />}
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={PackagePlus} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Equipamentos</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>
      <div className='flex items-center justify-between p-4'>
        <div>
          <InputSearch placeholder="Buscar equipamento" url="register-equipments.index" />
        </div>
        <div>
          <CreateEquipment />
        </div>
      </div>

      <div className='p-4'>
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipments?.data.length ?
                equipments?.data?.map((equipment: any) => (
                  <TableRow key={equipment.id}>
                    <TableCell>{equipment.id}</TableCell>
                    <TableCell className="font-medium">{equipment.equipment}</TableCell>
                    <TableCell>{moment(equipment.created_at).format("DD/MM/YYYY")}</TableCell>
                    <TableCell className='flex justify-end gap-2'>
                      <EditEquipment equipment={equipment} />
                      <ActionDelete title={'esta marca'} url={'register-equipments.destroy'} param={equipment.id} />

                    </TableCell>
                  </TableRow>
                ))
                : (
                  <TableRow>
                    <TableCell colSpan={4} className='h-16 w-full flex items-center justify-center'>
                      Não há dados a serem mostrados no momento.
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>
                    <AppPagination data={equipments} />
                  </TableCell>
                </TableRow>
              </TableFooter>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}
