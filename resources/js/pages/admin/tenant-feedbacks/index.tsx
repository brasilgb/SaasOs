import AlertSuccess from '@/components/app-alert-success';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin/admin-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronRight, MessageSquareMore } from 'lucide-react';
import moment from 'moment';
import { Fragment, FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Feedback SaaS',
        href: route('admin.tenant-feedbacks.index'),
    },
];

function statusBadgeClass(status?: string | null) {
    if (status === 'submitted') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (status === 'opened') return 'border-sky-200 bg-sky-50 text-sky-700';
    return 'border-amber-200 bg-amber-50 text-amber-700';
}

function recoveryBadgeClass(status?: string | null) {
    if (status === 'resolved') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (status === 'in_progress') return 'border-sky-200 bg-sky-50 text-sky-700';
    if (status === 'pending') return 'border-amber-200 bg-amber-50 text-amber-700';
    return 'border-slate-200 bg-slate-50 text-slate-600';
}

function ratingBadgeClass(rating?: number | null) {
    if (!rating) return 'border-slate-200 bg-slate-50 text-slate-600';
    if (rating <= 3) return 'border-rose-200 bg-rose-50 text-rose-700';
    if (rating === 4) return 'border-amber-200 bg-amber-50 text-amber-700';
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

function RecoveryForm({ feedback, users, recoveryStatuses, testimonialStatuses }: any) {
    const form = useForm({
        feedback_recovery_assigned_to: feedback.feedback_recovery_assigned_to ?? '',
        feedback_recovery_status: feedback.feedback_recovery_status ?? '',
        feedback_recovery_notes: feedback.feedback_recovery_notes ?? '',
        testimonial_status: feedback.testimonial_status ?? '',
        testimonial_public_name: feedback.testimonial_public_name ?? '',
        testimonial_public_role: feedback.testimonial_public_role ?? '',
        testimonial_excerpt: feedback.testimonial_excerpt ?? feedback.feedback_comment ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.patch(route('admin.tenant-feedbacks.update', feedback.id), {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <select
                value={form.data.feedback_recovery_assigned_to}
                onChange={(event) => form.setData('feedback_recovery_assigned_to', event.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
                <option value="">Sem responsável</option>
                {users.map((user: any) => (
                    <option key={user.id} value={user.id}>
                        {user.name}
                    </option>
                ))}
            </select>

            <select
                value={form.data.feedback_recovery_status}
                onChange={(event) => form.setData('feedback_recovery_status', event.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
                <option value="">Sem status</option>
                {recoveryStatuses.map((status: string) => (
                    <option key={status} value={status}>
                        {status}
                    </option>
                ))}
            </select>

            <textarea
                value={form.data.feedback_recovery_notes}
                onChange={(event) => form.setData('feedback_recovery_notes', event.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Anotações da tratativa"
            />

            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">Depoimento</p>

                <select
                    value={form.data.testimonial_status}
                    onChange={(event) => form.setData('testimonial_status', event.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    <option value="">Sem status</option>
                    {testimonialStatuses.map((status: string) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>

                <input
                    value={form.data.testimonial_public_name}
                    onChange={(event) => form.setData('testimonial_public_name', event.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Nome público"
                />

                <input
                    value={form.data.testimonial_public_role}
                    onChange={(event) => form.setData('testimonial_public_role', event.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Cargo ou contexto"
                />

                <textarea
                    value={form.data.testimonial_excerpt}
                    onChange={(event) => form.setData('testimonial_excerpt', event.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Trecho aprovado para a landing"
                />
            </div>

            <Button type="submit" size="sm" disabled={form.processing}>
                {form.processing ? 'Salvando...' : 'Salvar'}
            </Button>
        </form>
    );
}

export default function TenantFeedbacksIndex({ feedbacks, filters, summary, users, recoveryStatuses, testimonialStatuses, flash }: any) {
    const [selectedFeedbackId, setSelectedFeedbackId] = useState<number | null>(feedbacks?.data?.[0]?.id ?? null);

    const queryBase = {
        ...(filters?.search ? { search: filters.search } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.recovery_status ? { recovery_status: filters.recovery_status } : {}),
        ...(filters?.source ? { source: filters.source } : {}),
        ...(filters?.rating ? { rating: filters.rating } : {}),
        ...(filters?.testimonial_status ? { testimonial_status: filters.testimonial_status } : {}),
    };

    const quickFilters = [
        { label: 'Todos', params: {} },
        { label: 'Pendentes', params: { status: 'pending' } },
        { label: 'Respondidos', params: { status: 'submitted' } },
        { label: 'Notas baixas', params: { rating: 'low' } },
        { label: 'Recuperação pendente', params: { recovery_status: 'pending' } },
        { label: 'Depoimentos pendentes', params: { testimonial_status: 'pending' } },
    ];

    return (
        <AdminLayout>
            <Head title="Feedback SaaS" />
            {flash?.success && <AlertSuccess message={flash.success} />}

            <div className="flex min-h-16 w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Icon iconNode={MessageSquareMore} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Feedback SaaS</h2>
                </div>
                <div className="sm:ml-auto sm:text-right">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="space-y-4 p-4">
                <div className="grid gap-4 md:grid-cols-5">
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="mt-2 text-2xl font-semibold">{summary?.total ?? 0}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Pendentes</p>
                        <p className="mt-2 text-2xl font-semibold">{summary?.pending ?? 0}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Respondidos</p>
                        <p className="mt-2 text-2xl font-semibold">{summary?.submitted ?? 0}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Notas baixas</p>
                        <p className="mt-2 text-2xl font-semibold">{summary?.low_rating ?? 0}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Depoimentos pendentes</p>
                        <p className="mt-2 text-2xl font-semibold">{summary?.testimonial_pending ?? 0}</p>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                    <form method="get" action={route('admin.tenant-feedbacks.index')} className="grid gap-3 lg:grid-cols-6">
                        <input
                            type="text"
                            name="search"
                            defaultValue={filters?.search ?? ''}
                            placeholder="Buscar empresa ou e-mail"
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                        <select name="status" defaultValue={filters?.status ?? ''} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">Todos os status</option>
                            <option value="pending">Pendente</option>
                            <option value="opened">Aberto</option>
                            <option value="submitted">Respondido</option>
                        </select>
                        <select
                            name="recovery_status"
                            defaultValue={filters?.recovery_status ?? ''}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Toda recuperação</option>
                            <option value="without_recovery">Sem recuperação</option>
                            <option value="pending">Pendente</option>
                            <option value="in_progress">Em andamento</option>
                            <option value="resolved">Resolvido</option>
                        </select>
                        <select name="rating" defaultValue={filters?.rating ?? ''} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">Todas as notas</option>
                            <option value="low">Até 3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                        <select
                            name="testimonial_status"
                            defaultValue={filters?.testimonial_status ?? ''}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Todo depoimento</option>
                            <option value="without_testimonial">Sem consentimento</option>
                            <option value="pending">Pendente</option>
                            <option value="approved">Aprovado</option>
                            <option value="rejected">Rejeitado</option>
                            <option value="published">Publicado</option>
                        </select>
                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1">
                                Filtrar
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('admin.tenant-feedbacks.index')}>Limpar</Link>
                            </Button>
                        </div>
                    </form>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {quickFilters.map((filter) => (
                            <Link key={filter.label} href={route('admin.tenant-feedbacks.index', { ...queryBase, ...filter.params })}>
                                <Badge variant="outline">{filter.label}</Badge>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border bg-card">
                    {feedbacks?.data?.length ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="w-12 px-4 py-3 font-medium"></th>
                                        <th className="px-4 py-3 font-medium">Empresa</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Nota</th>
                                        <th className="px-4 py-3 font-medium">Recuperação</th>
                                        <th className="px-4 py-3 font-medium">Depoimento</th>
                                        <th className="px-4 py-3 font-medium">Respondido em</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedbacks.data.map((feedback: any) => {
                                        const isSelected = selectedFeedbackId === feedback.id;

                                        return (
                                            <Fragment key={feedback.id}>
                                                <tr
                                                    className={`cursor-pointer border-t transition-colors hover:bg-muted/30 ${isSelected ? 'bg-muted/20' : ''}`}
                                                    onClick={() => setSelectedFeedbackId((current) => (current === feedback.id ? null : feedback.id))}
                                                >
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background text-muted-foreground">
                                                            <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="space-y-1">
                                                            <p className="font-medium">{feedback.tenant?.company || feedback.tenant?.name}</p>
                                                            <p className="text-xs text-muted-foreground">{feedback.tenant?.email || '-'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className={statusBadgeClass(feedback.feedback_status)}>
                                                            {feedback.feedback_status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className={ratingBadgeClass(feedback.feedback_rating)}>
                                                            {feedback.feedback_rating ? `${feedback.feedback_rating}/5` : 'Sem nota'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className={recoveryBadgeClass(feedback.feedback_recovery_status)}>
                                                            {feedback.feedback_recovery_status || 'Sem tratativa'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className={recoveryBadgeClass(feedback.testimonial_status)}>
                                                            {feedback.testimonial_status || 'Sem depoimento'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {feedback.feedback_submitted_at ? moment(feedback.feedback_submitted_at).format('DD/MM/YYYY HH:mm') : '-'}
                                                    </td>
                                                </tr>

                                                {isSelected ? (
                                                    <tr className="border-t bg-background/70">
                                                        <td colSpan={7} className="px-4 py-4">
                                                            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_340px]">
                                                                <div className="space-y-4">
                                                                    <div className="grid gap-3 rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground md:grid-cols-2">
                                                                        <p>E-mail: {feedback.tenant?.email || '-'}</p>
                                                                        <p>Origem: {feedback.feedback_source}</p>
                                                                        <p>Enviado em: {feedback.feedback_sent_at ? moment(feedback.feedback_sent_at).format('DD/MM/YYYY HH:mm') : '-'}</p>
                                                                        <p>Respondido em: {feedback.feedback_submitted_at ? moment(feedback.feedback_submitted_at).format('DD/MM/YYYY HH:mm') : '-'}</p>
                                                                    </div>

                                                                    {feedback.feedback_comment ? (
                                                                        <div className="rounded-2xl border bg-muted/20 p-4 text-sm leading-relaxed text-foreground">
                                                                            {feedback.feedback_comment}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                                                                            Sem comentário enviado.
                                                                        </div>
                                                                    )}

                                                                    {feedback.testimonial_consent_at ? (
                                                                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                                                            Cliente autorizou avaliação para depoimento público.
                                                                        </div>
                                                                    ) : null}

                                                                    <div className="flex flex-wrap gap-2">
                                                                        <a
                                                                            href={route('tenant.feedback.show', feedback.feedback_token)}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-sm font-medium text-primary underline underline-offset-4"
                                                                        >
                                                                            Abrir formulário público
                                                                        </a>
                                                                    </div>
                                                                </div>

                                                                <div className="w-full xl:max-w-sm">
                                                                    <RecoveryForm
                                                                        feedback={feedback}
                                                                        users={users}
                                                                        recoveryStatuses={recoveryStatuses}
                                                                        testimonialStatuses={testimonialStatuses}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : null}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-10 text-center text-muted-foreground">
                            Nenhum feedback encontrado com os filtros atuais.
                        </div>
                    )}
                </div>

                <AppPagination data={feedbacks} />
            </div>
        </AdminLayout>
    );
}
