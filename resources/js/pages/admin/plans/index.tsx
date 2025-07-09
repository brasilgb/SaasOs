import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon'
import InputSearch from '@/components/inputSearch'
import AdminLayout from '@/layouts/admin/admin-layout'
import { Head, Link } from '@inertiajs/react'
import React from 'react'
import CreateTenant from '../tenants/create-tenant'
import { Building, Plus } from 'lucide-react'
import { BreadcrumbItem } from '@/types'
import { Button } from '@/components/ui/button'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Planos',
        href: "#",
    },
];

export default function PlansIndex() {
    return (
        <AdminLayout>
            <Head title="Planos" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={Building} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Planos</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className='flex items-center justify-between p-4'>
                <div>
                    <InputSearch placeholder="Buscar plano" url="admin.tenants.index" />
                </div>
                <div>
                    <Button variant="default" asChild>
                        <Link href={route('admin.plans.create')}>
                            <Plus />
                            Plano
                        </Link>
                    </Button>
                </div>
            </div>

        </AdminLayout>
    )
}
