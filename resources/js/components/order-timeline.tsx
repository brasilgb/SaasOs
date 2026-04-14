import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orderStatusLabel } from '@/Utils/order-status';
import { Camera, Clock3, FileText, MessageSquareMore, Package, ReceiptText, ShieldCheck, Wallet } from 'lucide-react';
import moment from 'moment';

type TimelineUser = {
    name?: string | null;
};

type StatusHistoryItem = {
    id: number;
    status: number;
    note?: string | null;
    created_at: string;
    user?: TimelineUser | null;
};

type OrderLogItem = {
    id: number;
    action: string;
    data?: Record<string, unknown> | null;
    created_at: string;
    user?: TimelineUser | null;
};

type OrderTimelineProps = {
    statusHistory?: StatusHistoryItem[];
    logs?: OrderLogItem[];
    mode?: 'internal' | 'public';
};

type TimelineEvent = {
    id: string;
    createdAt: string;
    title: string;
    description?: string;
    actor?: string;
    category: 'status' | 'payment' | 'parts' | 'fiscal' | 'feedback' | 'update' | 'creation' | 'image';
    statusValue?: number;
};

const categoryMeta = {
    creation: { icon: FileText, badge: 'Criação' },
    status: { icon: Clock3, badge: 'Status' },
    payment: { icon: Wallet, badge: 'Pagamento' },
    parts: { icon: Package, badge: 'Peças' },
    image: { icon: Camera, badge: 'Imagem' },
    fiscal: { icon: ReceiptText, badge: 'Fiscal' },
    feedback: { icon: ShieldCheck, badge: 'Feedback' },
    update: { icon: MessageSquareMore, badge: 'Atualização' },
} as const;

function formatMoney(value: unknown): string | null {
    if (typeof value !== 'number' && typeof value !== 'string') return null;

    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(numeric);
}

function describeLog(log: OrderLogItem): Omit<TimelineEvent, 'id' | 'createdAt' | 'actor'> {
    const data = log.data ?? {};

    switch (log.action) {
        case 'created':
            return {
                title: 'Ordem criada',
                description: typeof data.status_label === 'string' ? `Status inicial: ${data.status_label}` : undefined,
                category: 'creation',
            };
        case 'status_changed':
            return {
                title: 'Status alterado',
                description:
                    typeof data.from_label === 'string' && typeof data.to_label === 'string'
                        ? `${data.from_label} -> ${data.to_label}`
                        : undefined,
                category: 'status',
                statusValue: typeof data.to === 'number' ? data.to : undefined,
            };
        case 'payment_registered':
            return {
                title: 'Pagamento registrado',
                description: [formatMoney(data.amount), data.payment_method].filter(Boolean).join(' • ') || undefined,
                category: 'payment',
            };
        case 'payment_removed':
            return {
                title: 'Pagamento removido',
                description: [formatMoney(data.amount), data.payment_method].filter(Boolean).join(' • ') || undefined,
                category: 'payment',
            };
        case 'part_removed':
            return {
                title: 'Peça removida da ordem',
                description: [typeof data.part_name === 'string' ? data.part_name : null, formatMoney(data.removed_total)]
                    .filter(Boolean)
                    .join(' • ') || undefined,
                category: 'parts',
            };
        case 'parts_synced':
            return {
                title: 'Peças da ordem sincronizadas',
                description: [
                    typeof data.items_count === 'number' ? `${data.items_count} item(ns)` : null,
                    typeof data.total_quantity === 'number' ? `${data.total_quantity} unidade(s)` : null,
                ]
                    .filter(Boolean)
                    .join(' • ') || undefined,
                category: 'parts',
            };
        case 'image_uploaded':
            return {
                title: 'Imagem adicionada à ordem',
                description: [
                    typeof data.count === 'number' ? `${data.count} arquivo(s)` : null,
                    typeof data.total_images === 'number' ? `${data.total_images} imagem(ns) no total` : null,
                ]
                    .filter(Boolean)
                    .join(' • ') || undefined,
                category: 'image',
            };
        case 'image_deleted':
            return {
                title: 'Imagem removida da ordem',
                description: typeof data.filename === 'string' ? data.filename : undefined,
                category: 'image',
            };
        case 'fiscal_registered':
            return {
                title: 'Comprovante fiscal registrado',
                description: typeof data.fiscal_document_number === 'string' ? `Documento: ${data.fiscal_document_number}` : undefined,
                category: 'fiscal',
            };
        case 'feedback_marked':
            return {
                title: 'Feedback marcado',
                description: 'Feedback do pós-atendimento foi registrado.',
                category: 'feedback',
            };
        case 'updated':
            return {
                title: 'Dados da ordem atualizados',
                description: 'Campos da ordem foram alterados.',
                category: 'update',
            };
        default:
            return {
                title: 'Evento operacional',
                description: log.action,
                category: 'update',
            };
    }
}

const publicAllowedActions = new Set([
    'created',
    'status_changed',
    'payment_registered',
    'payment_removed',
    'image_uploaded',
    'image_deleted',
    'fiscal_registered',
]);

export function OrderTimeline({ statusHistory = [], logs = [], mode = 'internal' }: OrderTimelineProps) {
    const statusEvents: TimelineEvent[] = statusHistory.map((item) => ({
        id: `status-${item.id}`,
        createdAt: item.created_at,
        title: 'Status registrado',
        description: item.note || orderStatusLabel(item.status),
        actor: item.user?.name || undefined,
        category: 'status',
        statusValue: item.status,
    }));

    const filteredLogs =
        mode === 'public'
            ? logs.filter((item) => publicAllowedActions.has(item.action))
            : logs;

    const logEvents: TimelineEvent[] = filteredLogs.map((item) => {
        const described = describeLog(item);

        return {
            id: `log-${item.id}`,
            createdAt: item.created_at,
            actor: item.user?.name || undefined,
            ...described,
        };
    });

    const events = [...statusEvents, ...logEvents].sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf());

    return (
        <Card>
            <CardHeader>
                <CardTitle>{mode === 'public' ? 'Andamento da ordem' : 'Linha do tempo da ordem'}</CardTitle>
            </CardHeader>
            <CardContent>
                {events.length === 0 ? (
                    <div className="text-muted-foreground text-sm">Nenhum evento registrado até o momento.</div>
                ) : (
                    <div className="space-y-4">
                        {events.map((event, index) => {
                            const meta = categoryMeta[event.category];
                            const Icon = meta.icon;

                            return (
                                <div key={event.id} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-full border">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        {index < events.length - 1 && <div className="bg-border mt-2 h-full min-h-6 w-px" />}
                                    </div>

                                    <div className="flex-1 rounded-lg border p-3">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium">{event.title}</span>
                                                <Badge variant="outline">{meta.badge}</Badge>
                                                {typeof event.statusValue === 'number' && (
                                                    <StatusBadge category="ordem" value={event.statusValue} />
                                                )}
                                            </div>

                                            {event.description && <p className="text-muted-foreground text-sm">{event.description}</p>}

                                            <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
                                                <span>{moment(event.createdAt).format('DD/MM/YYYY [às] HH:mm')}</span>
                                                {mode === 'internal' && event.actor && <span>por {event.actor}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
