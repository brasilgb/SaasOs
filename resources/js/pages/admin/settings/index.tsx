import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon'
import InputSearch from '@/components/inputSearch';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin/admin-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react'
import { Building, Plus } from 'lucide-react';
import React from 'react'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('admin.dashboard'),
  },
  {
    title: 'Configurações',
    href: "#",
  },
];

export default function SettingsIndex() {
  return (
    <AdminLayout>
      <Head title="Configurações" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={Building} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Configurações</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>
    </AdminLayout>
  )
}
