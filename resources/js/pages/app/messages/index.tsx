import ActionDelete from '@/components/action-delete';
import { AppLoadMessage } from '@/components/app-load-message';
import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { statusMessageByValue } from '@/Utils/functions';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, MessageSquareMore, Plus } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel',
        href: route('app.dashboard'),
    },
    {
        title: 'Mensagens',
        href: '#',
    },
];

function messageStatusBadgeClass(status: number | string) {
    return Number(status) === 0
        ? 'border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200'
        : 'border-emerald-200 bg-emerald-100 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200';
}

export default function Messages({ messages, search }: any) {
    const { auth, ziggy } = usePage().props as any;
    const currentQuery = ziggy?.query ?? {};
    const currentStatus = currentQuery.status ?? 'all';
    const currentFilter = currentQuery.filter ?? 'all';
    const messageStatusFilter = [
        { value: 'all', label: 'Todos os status' },
        { value: '0', label: 'Não lida' },
        { value: '1', label: 'Lida' },
    ];
    const messageOperationFilter = [
        { value: 'mine', label: 'Minhas mensagens', param: 'filter' as const },
        { value: 'received', label: 'Recebidas', param: 'filter' as const },
        { value: 'sent', label: 'Enviadas', param: 'filter' as const },
    ];
    const canViewAllMessages = ['root_system', 'root_app', 'administrator'].includes(auth.role);
    const operationFilters = canViewAllMessages
        ? [{ value: 'all', label: 'Todas', param: 'filter' as const }, ...messageOperationFilter]
        : [{ value: 'all', label: 'Minhas mensagens', param: 'filter' as const }, ...messageOperationFilter.filter((item) => item.value !== 'mine')];

    const updateFilter = (key: 'filter' | 'status', value: string) => {
        router.get(
            route('app.messages.index'),
            {
                ...currentQuery,
                page: undefined,
                [key]: value === 'all' ? undefined : value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mensagens" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={MessageSquareMore} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Mensagens</h2>
                </div>
                <p className="text-muted-foreground text-sm">Envie e receba mensagens internas entre os usuários do sistema.</p>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full min-w-0 lg:max-w-[420px] lg:flex-1">
                    <InputSearch placeholder="Buscar por núm. da mensagem ou destinatário" url="app.messages.index" />
                </div>
                <div className="flex w-full flex-col gap-2 md:flex-row lg:w-auto lg:shrink-0">
                    <div className="w-full md:w-56">
                        <Select value={currentFilter} onValueChange={(value) => updateFilter('filter', value)}>
                            <SelectTrigger className="w-full">
                                <span>{operationFilters.find((item) => item.value === currentFilter)?.label ?? 'Todas'}</span>
                            </SelectTrigger>
                            <SelectContent>
                                {operationFilters.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full md:w-48">
                        <Select value={currentStatus} onValueChange={(value) => updateFilter('status', value)}>
                            <SelectTrigger className="w-full">
                                <span>{messageStatusFilter.find((item) => item.value === currentStatus)?.label ?? 'Todos os status'}</span>
                            </SelectTrigger>
                            <SelectContent>
                                {messageStatusFilter.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex w-full flex-col gap-2 md:flex-row lg:w-auto lg:shrink-0 lg:justify-end">
                    <Button variant={'default'} asChild className="w-full whitespace-nowrap md:w-auto">
                        <Link href={route('app.messages.create')}>
                            <Plus className="h-4 w-4" />
                            <span>Nova mensagem</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <PaginationSummary data={messages} />
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Pessoas</TableHead>
                                <TableHead>Operação</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="min-w-[120px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {messages?.data.length > 0 ? (
                                messages?.data?.map((message: any) => (
                                    <TableRow key={message.id}>
                                        <TableCell>{message.message_number}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">De:</span> {message.sender.name}
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">Para:</span> {message.recipient.name}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {auth.user.id === message.sender_id ? (
                                                <Badge variant={'secondary'} className="bg-green-500 text-white">
                                                    Enviada
                                                </Badge>
                                            ) : (
                                                <Badge variant={'destructive'}>Recebida</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={messageStatusBadgeClass(message.status)}>
                                                {statusMessageByValue(Number(message.status))}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{moment(message.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="min-w-[120px]">
                                            {message.sender_id == auth.user.id ? (
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <Button
                                                        asChild
                                                        size="icon"
                                                        className="bg-orange-500 text-white hover:bg-orange-600"
                                                        title="Abrir mensagem"
                                                    >
                                                        <Link
                                                            href={route('app.messages.edit', message.id)}
                                                            data={{ page: messages.current_page, search: search }}
                                                            aria-label={`Abrir mensagem ${message.message_number}`}
                                                        >
                                                            {(message.sender_id === auth.user.id) === message.status ? (
                                                                <Eye className="h-4 w-4" />
                                                            ) : (
                                                                <Edit className="h-4 w-4" />
                                                            )}
                                                        </Link>
                                                    </Button>

                                                    <ActionDelete title={'esta mensagem'} url={'app.messages.destroy'} param={message.id} />
                                                </div>
                                            ) : (
                                                <AppLoadMessage
                                                    message={message}
                                                    canMarkRead={Number(message.recipient_id) === Number(auth.user.id)}
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="flex h-16 w-full items-center justify-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={6}>
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
