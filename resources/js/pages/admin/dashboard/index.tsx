import { KpiDashboard } from '@/components/kpi-dashboard'
import AdminLayout from '@/layouts/admin/admin-layout'
import { Head } from '@inertiajs/react'
import { Building, User } from 'lucide-react'

export default function Dashboard({ metrics }: any) {

  return (
    <AdminLayout>
      <Head title="Dashboard" />
      <div className='p-4'>
        <div className="grid md:md:grid-cols-3 gap-4 rounded-xl">
          <KpiDashboard link={route('admin.users.index')} title="Usuários" value={metrics?.users?.length} icon={<User className='h-10 w-10' />} description="Usários administradores" />
          <KpiDashboard link={route('admin.tenants.index')} title="Empresas" value={metrics?.companies?.length} icon={<Building className='h-10 w-10' />} description="Todas as empresas cadastradas" />
        </div>
      </div>
    </AdminLayout>
  )
}
