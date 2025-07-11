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
        title: 'Planos',
        href: "#",
    },
];

export default function UsersIndex() {
    return (
        <AdminLayout>
            <Head title="Usuários" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={Building} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Usuários</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className='flex items-center justify-between p-4'>
                <div>
                    <InputSearch placeholder="Buscar usuário" url="admin.users.index" />
                </div>
                <div>
                    <Button variant="default" asChild>
                        <Link href={route('admin.users.create')}>
                            <Plus />
                            Usuários
                        </Link>
                    </Button>
                </div>
            </div>
        </AdminLayout>
    )
}
