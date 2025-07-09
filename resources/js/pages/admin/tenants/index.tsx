import AdminLayout from '@/layouts/admin/admin-layout'
import { Head } from '@inertiajs/react'
import { BreadcrumbItem } from '@/types';
import React from 'react'
import { Building, PackagePlus } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import CreateTenant from './create-tenant';
import InputSearch from '@/components/inputSearch';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('admin.dashboard'),
  },
  {
    title: 'Empresas',
    href: route('admin.tenants.index'),
  },
];

export default function TenantsIndex({  tenants }: any) {
  return (
    <AdminLayout>
      <Head title="Empresas" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={Building} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Empresas</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>
      <div className='flex items-center justify-between p-4'>
        <div>
          <InputSearch placeholder="Buscar empresa" url="admin.tenants.index" />
        </div>
        <div>
          <CreateTenant tenants={tenants} />
        </div>
      </div>

    </AdminLayout>
  )
}
