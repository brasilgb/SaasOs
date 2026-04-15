import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CircleCheckBig, ClipboardList, Clock3, Wrench } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Tarefas', href: route('app.follow-ups.tasks') },
];

export default function FollowUpTasks({ filters, summary, dailyAgenda, technicians }: any) {
    const { auth } = usePage<{ auth?: { role?: string; permissions?: string[] } }>().props;
    const canManageOrders = Boolean(auth?.role !== 'technician' && auth?.permissions?.includes('orders'));

    const applyFilters = (next: Record<string, string>) => {
        router.get(
            route('app.follow-ups.tasks'),
            {
                type: next.type ?? filters?.type ?? 'all',
                assigned_to: next.assigned_to ?? filters?.assigned_to ?? 'all',
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleCompleteTask = (orderId: number, scope: 'budget' | 'payment') => {
        const reason = window.prompt('Informe o motivo da conclusão desta tarefa:');

        if (!reason || !reason.trim()) {
            return;
        }

        router.post(
            route('app.follow-ups.complete-task', orderId),
            {
                scope,
                reason: reason.trim(),
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleSnoozeTask = (orderId: number, scope: 'budget' | 'payment') => {
        const choice = window.prompt('Adiar por quantos dias? (1 a 30)', '2');
        const days = choice ? Number(choice) : NaN;

        if (!Number.isInteger(days) || days < 1 || days > 30) {
            return;
        }

        router.post(
            route('app.follow-ups.snooze-task', orderId),
            { scope, days },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleAssignTask = (orderId: number, scope: 'budget' | 'payment', userId: string) => {
        router.post(
            route('app.follow-ups.assign-task', orderId),
            {
                scope,
                user_id: userId === 'unassigned' ? null : Number(userId),
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Tarefas" />

            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={ClipboardList} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Tarefas</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Tarefas do dia</CardTitle></CardHeader>
                        <CardContent className="text-3xl font-bold">{summary?.today_tasks ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Orçamento</CardTitle></CardHeader>
                        <CardContent className="text-3xl font-bold">{summary?.budget_tasks ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Cobrança</CardTitle></CardHeader>
                        <CardContent className="text-3xl font-bold">{summary?.payment_tasks ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Sem responsável pelo acompanhamento</CardTitle></CardHeader>
                        <CardContent className="text-3xl font-bold">{summary?.unassigned_tasks ?? 0}</CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Filtros operacionais</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <span className="text-sm font-medium">Tipo</span>
                            <Select value={filters?.type ?? 'all'} onValueChange={(value) => applyFilters({ type: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="budget">Orçamento</SelectItem>
                                    <SelectItem value="payment">Cobrança</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <span className="text-sm font-medium">Responsável pelo acompanhamento</span>
                            <Select value={filters?.assigned_to ?? 'all'} onValueChange={(value) => applyFilters({ assigned_to: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="unassigned">Sem responsável pelo acompanhamento</SelectItem>
                                    {technicians?.map((technician: any) => (
                                        <SelectItem key={`filter-${technician.id}`} value={String(technician.id)}>
                                            {technician.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Central de tarefas do dia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!dailyAgenda?.length ? (
                            <p className="text-muted-foreground text-sm">Nenhuma tarefa prioritária no momento.</p>
                        ) : (
                            <div className="max-h-[620px] overflow-auto rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Técnico</TableHead>
                                            <TableHead>Responsável pelo acompanhamento</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Dias</TableHead>
                                            <TableHead>Próxima ação</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dailyAgenda.map((item: any) => (
                                            <TableRow key={`${item.scope}-${item.id}`}>
                                                <TableCell>{item.order_number}</TableCell>
                                                <TableCell>{item.customer}</TableCell>
                                                <TableCell>{item.technician}</TableCell>
                                                <TableCell className="min-w-[190px]">
                                                    {canManageOrders ? (
                                                        <Select
                                                            value={item.assigned_to_id ? String(item.assigned_to_id) : 'unassigned'}
                                                            onValueChange={(value) => handleAssignTask(item.id, item.scope, value)}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Definir responsável pelo acompanhamento" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="unassigned">Sem responsável pelo acompanhamento</SelectItem>
                                                                {technicians?.map((technician: any) => (
                                                                    <SelectItem key={`task-${technician.id}`} value={String(technician.id)}>
                                                                        {technician.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <span className="text-sm">{item.assigned_to ?? 'Sem responsável pelo acompanhamento'}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="capitalize">{item.type}</TableCell>
                                                <TableCell>{item.days_pending}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span>{item.next_action?.label}</span>
                                                        <Badge
                                                            variant="secondary"
                                                            className={
                                                                item.next_action?.priority === 'critica'
                                                                    ? 'bg-rose-100 text-rose-900 hover:bg-rose-100'
                                                                    : item.next_action?.priority === 'alta'
                                                                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-100'
                                                                      : 'bg-blue-100 text-blue-900 hover:bg-blue-100'
                                                            }
                                                        >
                                                            {item.next_action?.priority === 'critica'
                                                                ? 'Crítica'
                                                                : item.next_action?.priority === 'alta'
                                                                  ? 'Alta'
                                                                  : 'Normal'}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {canManageOrders && (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant="outline"
                                                                    title="Concluir tarefa do dia"
                                                                    onClick={() => handleCompleteTask(item.id, item.scope)}
                                                                >
                                                                    <CircleCheckBig className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant="outline"
                                                                    title="Adiar tarefa"
                                                                    onClick={() => handleSnoozeTask(item.id, item.scope)}
                                                                >
                                                                    <Clock3 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button asChild size="icon" variant="outline" title="Abrir ordem">
                                                            <Link href={route('app.orders.edit', item.id)}>
                                                                <Wrench className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
