export const ORDER_STATUS = {
    OPEN: 1,
    CANCELLED: 2,
    BUDGET_GENERATED: 3,
    BUDGET_APPROVED: 4,
    BUDGET_REJECTED: 5,
    REPAIR_IN_PROGRESS: 6,
    SERVICE_COMPLETED: 7,
    SERVICE_NOT_EXECUTED: 8,
    CUSTOMER_NOTIFIED: 9,
    DELIVERED: 10,
} as const;

export type OrderStatusValue = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
    [ORDER_STATUS.OPEN]: 'Ordem Aberta',
    [ORDER_STATUS.CANCELLED]: 'Ordem Cancelada',
    [ORDER_STATUS.BUDGET_GENERATED]: 'Orçamento Gerado',
    [ORDER_STATUS.BUDGET_APPROVED]: 'Orçamento Aprovado',
    [ORDER_STATUS.BUDGET_REJECTED]: 'Orçamento reprovado',
    [ORDER_STATUS.REPAIR_IN_PROGRESS]: 'Reparo em andamento',
    [ORDER_STATUS.SERVICE_COMPLETED]: 'Serviço concluído',
    [ORDER_STATUS.SERVICE_NOT_EXECUTED]: 'Serviço não executado',
    [ORDER_STATUS.CUSTOMER_NOTIFIED]: 'Cliente avisado / aguardando retirada',
    [ORDER_STATUS.DELIVERED]: 'Entregue ao cliente',
};

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
}));

export const ORDER_BUDGET_STATUS_OPTIONS = [
    { value: String(ORDER_STATUS.OPEN), label: ORDER_STATUS_LABELS[ORDER_STATUS.OPEN] },
    { value: String(ORDER_STATUS.BUDGET_GENERATED), label: ORDER_STATUS_LABELS[ORDER_STATUS.BUDGET_GENERATED] },
    { value: String(ORDER_STATUS.BUDGET_APPROVED), label: ORDER_STATUS_LABELS[ORDER_STATUS.BUDGET_APPROVED] },
];

export const ORDER_STATUSES_COMPLETED: number[] = [
    ORDER_STATUS.SERVICE_COMPLETED,
    ORDER_STATUS.CUSTOMER_NOTIFIED,
];

export const ORDER_STATUSES_READY_FOR_INVOICE: number[] = [
    ORDER_STATUS.REPAIR_IN_PROGRESS,
    ORDER_STATUS.SERVICE_COMPLETED,
    ORDER_STATUS.SERVICE_NOT_EXECUTED,
];

export const ORDER_STATUSES_DELIVERED_FLOW: number[] = [
    ORDER_STATUS.CUSTOMER_NOTIFIED,
    ORDER_STATUS.DELIVERED,
];

export function orderStatusLabel(value: number): string {
    return ORDER_STATUS_LABELS[value as OrderStatusValue] ?? 'Status desconhecido';
}
