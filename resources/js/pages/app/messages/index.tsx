import ActionDelete from '@/components/action-delete';
import { AppLoadMessage } from '@/components/app-load-message';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { statusMessageByValue } from '@/Utils/functions';
import { Head, Link, usePage } from '@inertiajs/react';
import { Edit, Eye, MessageSquareMore, Plus } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Mensagens',
        href: '#',
    },
];

export default function Messages({ messages, search }: any) {
    const { auth } = usePage().props as any;
    return (
        <AppLayout>
            <Head title="Mensagens" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={MessageSquareMore} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Mensagens</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full">
                    <InputSearch placeholder="Buscar po número da mensagem nome do destinatário" url="app.messages.index" />
                </div>
                <div className="flex w-full justify-end">
                    <Button variant={'default'} asChild>
                        <Link href={route('app.messages.create')} className="w-full md:w-auto">
                            <Plus className="h-4 w-4" />
                            <span>Nova Mensagem</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
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
                            {messages?.data.length > 0 ? (
                                messages?.data?.map((message: any) => (
                                    <TableRow key={message.id}>
                                        <TableCell>{message.message_number}</TableCell>
                                        <TableCell>{message.sender.name}</TableCell>
                                        <TableCell>{message.recipient.name}</TableCell>
                                        <TableCell>
                                            {auth.user.id === message.sender_id ? (
                                                <Badge variant={'secondary'} className="bg-green-500 text-white">
                                                    Enviada
                                                </Badge>
                                            ) : (
                                                <Badge variant={'destructive'}>Recebida</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{<Badge variant={'default'}>{statusMessageByValue(message.status)}</Badge>}</TableCell>
                                        <TableCell>{moment(message.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="flex justify-end gap-2">
                                            {message.sender_id == auth.user.id ? (
                                                <>
                                                    <Button asChild size="icon" className="bg-orange-500 text-white hover:bg-orange-600">
                                                        <Link
                                                            href={route('app.messages.edit', message.id)}
                                                            data={{ page: messages.current_page, search: search }}
                                                        >
                                                            {(message.sender_id === auth.user.id) === message.status ? <Eye /> : <Edit />}
                                                        </Link>
                                                    </Button>

                                                    <ActionDelete title={'esta mensagem'} url={'app.messages.destroy'} param={message.id} />
                                                </>
                                            ) : (
                                                <AppLoadMessage message={message} />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="flex h-16 w-full items-center justify-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
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
    );
}
