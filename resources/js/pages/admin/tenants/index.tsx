import AdminLayout from '@/layouts/admin/admin-layout'
import { Head, Link } from '@inertiajs/react'
import { BreadcrumbItem } from '@/types';
import { Building, Building2, Edit, Plus } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { maskPhone } from '@/Utils/mask';
import moment from 'moment';
import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import { statusSaasByValue } from '@/Utils/functions';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('admin.dashboard'),
  },
  {
    title: 'Empresas',
    href: "#",
  },
];

export default function TenantsIndex({ tenants }: any) {

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
          <Button variant="default" asChild>
            <Link href={route('admin.tenants.create')}>
              <Plus />
              Empresa
            </Link>
          </Button>
        </div>
      </div>

      <div className='p-4'>
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criação</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants?.data.length > 0 ?
                tenants?.data?.map((tenant: any) => (
                  <TableRow key={tenant.id}>
                    <TableCell>{tenant.id}</TableCell>
                    <TableCell>{tenant.name}</TableCell>
                    <TableCell>{tenant.company}</TableCell>
                    <TableCell>{tenant.cnpj}</TableCell>
                    <TableCell>{tenant.email}</TableCell>
                    <TableCell>{maskPhone(tenant.phone)}</TableCell>
                    <TableCell>{statusSaasByValue(tenant.status)}</TableCell>
                    <TableCell>{moment(tenant.created_at).format("DD/MM/YYYY")}</TableCell>
                    <TableCell>{moment(tenant.expiration_date).format("DD/MM/YYYY")}</TableCell>
                    <TableCell>{tenant.plan.name}</TableCell>
                    <TableCell className='flex justify-end gap-2'>

                      <Button asChild size="icon" className="bg-green-500 hover:bg-green-500 text-white">
                        <a target='_blank' href={`https://wa.me/${tenant.whatsapp}?text=Olá, ${tenant.name}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                          </svg>
                        </a>
                      </Button>

                      <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Link href={route('admin.tenants.edit', tenant.id)}>
                          <Edit />
                        </Link>
                      </Button>

                      <ActionDelete title={'esta empresa'} url={'admin.tenants.destroy'} param={tenant.id} />

                    </TableCell>
                  </TableRow>
                ))
                : (
                  <TableRow>
                    <TableCell colSpan={11} className='h-16 w-full flex items-center justify-center'>
                      <span>Não há dados a serem mostrados no momento.</span>
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={11}>
                  <AppPagination data={tenants} />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

    </AdminLayout>
  )
}
