import AppPagination from '@/components/app-pagination';
import { toastSuccess, toastWarning } from '@/components/app-toast-messages';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Lightbulb } from 'lucide-react';
import { useEffect, type FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Melhorias e ajustes',
        href: route('app.improvement-requests.index'),
    },
];

function statusLabel(status: string) {
    if (status === 'reviewing') return 'Em análise';
    if (status === 'adjusting') return 'Ajustando';
    if (status === 'done') return 'Concluído';
    return 'Novo';
}

function typeLabel(type: string) {
    return type === 'adjustment' ? 'Ajuste' : 'Melhoria';
}

function statusBadgeClass(status: string) {
    if (status === 'reviewing') return 'border-amber-200 bg-amber-50 text-amber-700';
    if (status === 'adjusting') return 'border-sky-200 bg-sky-50 text-sky-700';
    if (status === 'done') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    return 'border-slate-200 bg-slate-50 text-slate-700';
}

function typeBadgeClass(type: string) {
    return type === 'adjustment' ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-cyan-200 bg-cyan-50 text-cyan-700';
}

const SLA_DAYS: Record<string, number> = {
    new: 1,
    reviewing: 3,
    adjusting: 7,
};

function slaInfo(request: any) {
    if (!request?.status || request.status === 'done' || !SLA_DAYS[request.status]) {
        return null;
    }

    const reference = request.reviewed_at && request.status !== 'new' ? request.reviewed_at : request.created_at;
    if (!reference) return null;

    const start = new Date(reference);
    const due = new Date(start);
    due.setDate(due.getDate() + SLA_DAYS[request.status]);

    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return {
            label: `Prazo em revisão. A última previsão venceu há ${Math.abs(diffDays)} dia(s)`,
            className: 'border-rose-200 bg-rose-50 text-rose-700',
        };
    }

    if (diffDays <= 1) {
        return {
            label: diffDays === 0 ? 'Nova atualização prevista para hoje' : 'Nova atualização prevista para amanhã',
            className: 'border-amber-200 bg-amber-50 text-amber-700',
        };
    }

    return {
        label: `Nova atualização prevista em até ${diffDays} dia(s)`,
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
}

function formatDateTime(value?: string | null) {
    if (!value) return null;

    return new Date(value).toLocaleString('pt-BR');
}

export default function TenantImprovementRequestsIndex({ requests, requestTypes, flash }: any) {
    const form = useForm({
        request_type: requestTypes?.[0] ?? 'improvement',
        title: '',
        description: '',
    });

    useEffect(() => {
        if (flash?.message) {
            toastSuccess('Sucesso', flash.message);
        }

        if (flash?.error) {
            toastWarning('Erro', flash.error);
        }
    }, [flash?.error, flash?.message]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(route('app.improvement-requests.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset('title', 'description'),
        });
    };

    return (
        <AppLayout>
            <Head title="Melhorias e ajustes" />

            <div className="flex min-h-16 w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Lightbulb} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Melhorias e ajustes</h2>
                </div>
                <div className="sm:ml-auto sm:text-right">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="space-y-4 p-4">
                <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Envie uma sugestão para o SigmaOS</h3>
                        <p className="text-muted-foreground text-sm">
                            Use este espaço para pedir ajustes na rotina atual ou sugerir melhorias para a evolução do sistema.
                        </p>
                    </div>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <div className="grid gap-2 sm:max-w-sm">
                            <Label htmlFor="request_type">Tipo</Label>
                            <select
                                id="request_type"
                                value={form.data.request_type}
                                onChange={(event) => form.setData('request_type', event.target.value)}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="improvement">Melhoria</option>
                                <option value="adjustment">Ajuste</option>
                            </select>
                            {form.errors.request_type ? <p className="text-sm text-red-500">{form.errors.request_type}</p> : null}
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Título</Label>
                                <input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(event) => form.setData('title', event.target.value)}
                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Ex.: Melhorar o acompanhamento de ordens"
                                />
                                {form.errors.title ? <p className="text-sm text-red-500">{form.errors.title}</p> : null}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Detalhes</Label>
                                <textarea
                                    id="description"
                                    rows={5}
                                    value={form.data.description}
                                    onChange={(event) => form.setData('description', event.target.value)}
                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Descreva o que precisa ser ajustado ou a melhoria que faria diferença na sua rotina."
                                />
                                {form.errors.description ? <p className="text-sm text-red-500">{form.errors.description}</p> : null}
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing ? 'Enviando...' : 'Enviar solicitação'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Solicitações enviadas</h3>
                        <p className="text-muted-foreground text-sm">Acompanhe as solicitações recentes registradas pela sua empresa.</p>
                    </div>

                    <div className="mt-6 space-y-4">
                        {requests?.data?.length ? (
                            requests.data.map((request: any) => {
                                const sla = slaInfo(request);

                                return (
                                <div key={request.id} className="rounded-3xl border bg-background/60 p-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="flex flex-wrap gap-2 pb-2">
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${typeBadgeClass(request.request_type)}`}>
                                                    {typeLabel(request.request_type)}
                                                </span>
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClass(request.status)}`}>
                                                    {statusLabel(request.status)}
                                                </span>
                                                {sla ? (
                                                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${sla.className}`}>
                                                        {sla.label}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="font-medium">{request.title}</p>
                                        </div>
                                        <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                                            {new Date(request.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                    <p className="mt-4 text-sm leading-relaxed">{request.description}</p>
                                    <div className="mt-4 grid gap-2 rounded-2xl border bg-muted/25 p-3 text-xs text-muted-foreground sm:grid-cols-3">
                                        <span>Enviada em: {formatDateTime(request.created_at)}</span>
                                        <span>Última atualização: {formatDateTime(request.updated_at)}</span>
                                        {request.reviewed_at ? <span>Respondida em: {formatDateTime(request.reviewed_at)}</span> : null}
                                    </div>
                                    {request.admin_notes ? (
                                        <div className="mt-4 rounded-2xl border bg-muted/40 p-4 text-sm">
                                            <strong className="block">Resposta da equipe</strong>
                                            <span className="mt-1 block leading-relaxed">{request.admin_notes}</span>
                                        </div>
                                    ) : null}
                                </div>
                            )})
                        ) : (
                            <p className="text-muted-foreground text-sm">Nenhuma solicitação registrada até o momento.</p>
                        )}
                    </div>

                    <div className="mt-6">
                        <AppPagination data={requests} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
