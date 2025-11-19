import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react'
import { Edit, Eye, MessageSquareMore, Pencil, Plus } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { AppLoadMessage } from '@/components/app-load-message';
import { statusMessageByValue } from '@/Utils/functions';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Mensagens',
    href: "#",
  },
];

export default function Messages({ messages }: any) {
  const { flash, auth } = usePage().props as any;
  return (
    <AppLayout>
      {flash.message && <AlertSuccess message={flash.message} />}
      <Head title="Mensagens" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={MessageSquareMore} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Mensagens</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div className='w-full'>
          <InputSearch placeholder="Buscar po número da mensagem nome do destinatário" url="app.messages.index" />
        </div>
        <div className='w-full flex justify-end'>
          <Button variant={'default'} asChild>
            <Link
              href={route('app.messages.create')}
            >
              <Plus className='h-4 w-4' />
              <span>Mensagem</span>
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
                <TableHead>Remetente</TableHead>
                <TableHead>Destinatário</TableHead>
                <TableHead>Operação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages?.data.length > 0 ?
                messages?.data?.map((message: any) => (
                  <TableRow key={message.id}>
                    <TableCell>{message.message_number}</TableCell>
                    <TableCell>{message.sender.name}</TableCell>
                    <TableCell>{message.recipient.name}</TableCell>
                    <TableCell>{auth.user.id === message.sender_id ? <Badge variant={'secondary'} className='bg-green-500 text-white'>Enviada</Badge> : <Badge variant={'destructive'}>Recebida</Badge>}</TableCell>
                    <TableCell>{<Badge variant={'default'}>{statusMessageByValue(message.status)}</Badge>}</TableCell>
                    <TableCell>{moment(message.created_at).format("DD/MM/YYYY")}</TableCell>
                    <TableCell className='flex justify-end gap-2'>
                      {message.sender_id !== auth.user.id
                        ? <AppLoadMessage message={message} />
                        : <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                          <Link href={route("app.messages.edit", message.id)}>
                            {message.sender_id === auth.user.id ? <Edit /> : <Eye />}
                          </Link>
                        </Button>}

                      <ActionDelete title={'esta mensagem'} url={'app.messages.destroy'} param={message.id} />

                    </TableCell>
                  </TableRow>
                ))
                : (
                  <TableRow>
                    <TableCell colSpan={7} className='h-16 w-full flex items-center justify-center'>
                      Não há dados a serem mostrados no momento.
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={7}>
                  <AppPagination data={messages} />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}