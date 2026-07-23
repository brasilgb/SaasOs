import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, CalendarDays, CheckCircle2, ClipboardList, Printer, Search, Users } from 'lucide-react';
import moment from 'moment';
import { FormEvent, useState } from 'react';

type TenantReport = {
    id: number;
    company: string;
    contact: string;
    email: string;
    plan: string;
    subscription: string;
    users_count: number;
    active_users_count: number;
    branches_count: number;
    orders_count: number;
    period_orders_count: number;
    delivered_orders_count: number;
    open_orders_count: number;
    last_login_at: string | null;
    last_order_at: string | null;
};

type Props = {
    filters: { start_date: string; end_date: string; search: string; activity: string };
    summary: {
        tenants: number;
        users: number;
        active_users: number;
        orders: number;
        delivered_orders: number;
        open_orders: number;
    };
    tenants: TenantReport[];
    generated_at: string;
};

const formatDateTime = (value: string | null) => (value ? moment(value).format('DD/MM/YYYY HH:mm') : 'Nunca registrado');

export default function AdminReports({ filters, summary, tenants, generated_at }: Props) {
    const [form, setForm] = useState(filters);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('admin.reports.index'), form, { preserveState: true, replace: true });
    };

    const clear = () => router.get(route('admin.reports.index'));

    const cards = [
        { label: 'Tenants encontrados', value: summary.tenants, detail: 'empresas no filtro', icon: Building2 },
        { label: 'Usuários', value: summary.users, detail: `${summary.active_users} acessaram nos últimos 30 dias`, icon: Users },
        { label: 'OS no período', value: summary.orders, detail: `${summary.delivered_orders} entregues`, icon: ClipboardList },
        { label: 'OS em andamento', value: summary.open_orders, detail: 'pendentes em todas as datas', icon: CheckCircle2 },
    ];

    return (
        <AdminLayout>
            <Head title="Relatórios gerenciais" />
            <main className="report-print-area space-y-5 p-4">
                <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Relatórios gerenciais</h1>
                        <p className="text-muted-foreground text-sm">Acompanhamento de tenants, usuários, acessos e ordens de serviço.</p>
                    </div>
                    <Button type="button" variant="outline" onClick={() => window.print()} className="no-print">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir relatório
                    </Button>
                </header>

                <div className="print-only hidden text-xs">
                    Período: {moment(filters.start_date).format('DD/MM/YYYY')} a {moment(filters.end_date).format('DD/MM/YYYY')} · Gerado em{' '}
                    {moment(generated_at).format('DD/MM/YYYY HH:mm')}
                </div>

                <form onSubmit={submit} className="no-print bg-card grid gap-3 rounded-xl border p-4 md:grid-cols-5">
                    <label className="space-y-1 text-sm">
                        <span>Data inicial</span>
                        <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                    </label>
                    <label className="space-y-1 text-sm">
                        <span>Data final</span>
                        <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                    </label>
                    <label className="space-y-1 text-sm">
                        <span>Atividade</span>
                        <select
                            className="bg-background h-9 w-full rounded-md border px-3 text-sm"
                            value={form.activity}
                            onChange={(e) => setForm({ ...form, activity: e.target.value })}
                        >
                            <option value="all">Todos os acessos</option>
                            <option value="active">Ativos nos últimos 30 dias</option>
                            <option value="inactive">Sem acesso há mais de 30 dias</option>
                            <option value="never">Nunca acessaram</option>
                        </select>
                    </label>
                    <label className="space-y-1 text-sm">
                        <span>Buscar tenant</span>
                        <Input
                            placeholder="Empresa, contato ou e-mail"
                            value={form.search}
                            onChange={(e) => setForm({ ...form, search: e.target.value })}
                        />
                    </label>
                    <div className="flex items-end gap-2">
                        <Button type="submit">
                            <Search className="mr-2 h-4 w-4" />
                            Filtrar
                        </Button>
                        <Button type="button" variant="ghost" onClick={clear}>
                            Limpar
                        </Button>
                    </div>
                </form>

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map(({ label, value, detail, icon: Icon }) => (
                        <div key={label} className="bg-card rounded-xl border p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">{label}</p>
                                    <p className="mt-1 text-3xl font-semibold">{value}</p>
                                </div>
                                <Icon className="text-primary h-5 w-5" />
                            </div>
                            <p className="text-muted-foreground mt-2 text-xs">{detail}</p>
                        </div>
                    ))}
                </section>

                <section className="bg-card overflow-hidden rounded-xl border">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <div>
                            <h2 className="font-semibold">Desempenho por tenant</h2>
                            <p className="text-muted-foreground text-sm">
                                OS do período de {moment(filters.start_date).format('DD/MM/YYYY')} a {moment(filters.end_date).format('DD/MM/YYYY')}.
                            </p>
                        </div>
                        <CalendarDays className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Plano / situação</TableHead>
                                    <TableHead className="text-center">Usuários</TableHead>
                                    <TableHead className="text-center">OS período</TableHead>
                                    <TableHead className="text-center">Entregues</TableHead>
                                    <TableHead className="text-center">Em andamento</TableHead>
                                    <TableHead>Último acesso</TableHead>
                                    <TableHead>Última OS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tenants.length ? (
                                    tenants.map((tenant) => (
                                        <TableRow key={tenant.id}>
                                            <TableCell>
                                                <Link href={route('admin.tenants.edit', tenant.id)} className="font-medium hover:underline">
                                                    {tenant.company}
                                                </Link>
                                                <div className="text-muted-foreground max-w-52 truncate text-xs">{tenant.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div>{tenant.plan}</div>
                                                <Badge variant="outline" className="mt-1">
                                                    {tenant.subscription}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <strong>{tenant.users_count}</strong>
                                                <div className="text-muted-foreground text-xs">{tenant.active_users_count} habilitados</div>
                                            </TableCell>
                                            <TableCell className="text-center font-medium">{tenant.period_orders_count}</TableCell>
                                            <TableCell className="text-center">{tenant.delivered_orders_count}</TableCell>
                                            <TableCell className="text-center">{tenant.open_orders_count}</TableCell>
                                            <TableCell className="text-sm whitespace-nowrap">{formatDateTime(tenant.last_login_at)}</TableCell>
                                            <TableCell className="text-sm whitespace-nowrap">{formatDateTime(tenant.last_order_at)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-muted-foreground h-24 text-center">
                                            Nenhum tenant encontrado para os filtros escolhidos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>
            </main>

            <style>{`
                @media print {
                    @page { size: landscape; margin: 10mm; }
                    body * { visibility: hidden !important; }
                    .report-print-area, .report-print-area * { visibility: visible !important; }
                    .report-print-area { position: absolute; inset: 0; width: 100%; padding: 0; color: #111827; background: white; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .report-print-area table { font-size: 9px; }
                    .report-print-area th, .report-print-area td { padding: 5px; }
                    .report-print-area section, .report-print-area tr { break-inside: avoid; }
                }
            `}</style>
        </AdminLayout>
    );
}
