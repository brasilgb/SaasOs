import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon'
import InputSearch from '@/components/inputSearch'
import { Button } from '@/components/ui/button'
import AdminLayout from '@/layouts/admin/admin-layout'
import { BreadcrumbItem } from '@/types'
import { Head, Link } from '@inertiajs/react'
import { Building, Plus } from 'lucide-react'
import React from 'react'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('admin.dashboard'),
  },
  {
    title: 'Filiais',
    href: "#",
  },
];

export default function BranchesIndex() {
  return (
    <AdminLayout>
      <Head title="Filiais" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={Building} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Filiais</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>
      <div className='flex items-center justify-between p-4'>
        <div>
          <InputSearch placeholder="Buscar filial" url="admin.tenants.index" />
        </div>
        <div>
          <Button variant="default" asChild>
            <Link href={route('admin.tenants.create')}>
              <Plus />
              Filial
            </Link>
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
