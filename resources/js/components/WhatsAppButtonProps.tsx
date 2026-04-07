import React from 'react';

type WhatsAppButtonProps = {
    phone: string;
    customerName: string;
    orderNumber?: string;
    status?: string | number;
    feedback?: boolean;

    whats?: {
        generatedbudget?: string;
        servicecompleted?: string;
        feedback?: string;
        defaultmessage?: string;
        tracking_token?: string;
    };

    className?: string;
};

const STATUS_BUDGET = 3;
const STATUS_COMPLETED = 7;

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
};

const normalizeStatus = (status?: string | number) => Number(status ?? 0);

const buildTrackingUrl = (trackingToken?: string) => {
    if (!trackingToken) return '';

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sigmaos.com.br';
    return `${origin}/os/${trackingToken}`;
};

const applyTemplate = (template: string, values: Record<string, string>) => {
    return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, rawKey) => {
        const normalizedKey = normalizePlaceholderKey(rawKey);
        return values[normalizedKey] ?? '';
    });
};

const normalizePlaceholderKey = (key: string) =>
    key
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/-/g, '_');

const hasPlaceholder = (template: string, key: string) => {
    const target = normalizePlaceholderKey(key);
    const placeholders = template.match(/\{\{\s*([^}]+?)\s*\}\}/g) || [];

    return placeholders.some((placeholder) => {
        const rawKey = placeholder.replace('{{', '').replace('}}', '');
        return normalizePlaceholderKey(rawKey) === target;
    });
};

const withGreeting = (greeting: string, customerName: string, content: string) => `${greeting}, ${customerName}!\n\n${content}`;

const normalizePhone = (phone: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return '';
    if (!cleanPhone.startsWith('55')) cleanPhone = `55${cleanPhone}`;
    return cleanPhone;
};

const getTemplateForContext = ({ status, feedback, whats }: Pick<WhatsAppButtonProps, 'status' | 'feedback' | 'whats'>): string | null => {
    const currentStatus = normalizeStatus(status);

    // prioridade máxima: janela de feedback
    if (feedback) {
        return whats?.feedback ?? null;
    }

    // status com template específico
    if (currentStatus === STATUS_BUDGET && whats?.generatedbudget) {
        return whats.generatedbudget;
    }

    if (currentStatus === STATUS_COMPLETED && whats?.servicecompleted) {
        return whats.servicecompleted;
    }

    // demais status usam mensagem padrão
    if (whats?.defaultmessage) {
        return whats.defaultmessage;
    }

    return null;
};

const formatTemplateMessage = ({
    template,
    greeting,
    customerName,
    values,
}: {
    template: string;
    greeting: string;
    customerName: string;
    values: Record<string, string>;
}) => {
    const parsed = applyTemplate(template, values).trim();
    if (!parsed) return '';

    if (hasPlaceholder(template, 'saudacao')) {
        return parsed;
    }

    return withGreeting(greeting, customerName, parsed);
};

const buildMessage = ({ customerName, orderNumber, status, feedback, whats }: Omit<WhatsAppButtonProps, 'phone' | 'className'>) => {
    const currentStatus = normalizeStatus(status);
    const greeting = getGreeting();
    const trackingUrl = buildTrackingUrl(whats?.tracking_token);
    const templateValues = {
        saudacao: greeting,
        saudação: greeting,
        cliente: customerName,
        ordem: String(orderNumber ?? ''),
        link_os: trackingUrl,
        status: String(currentStatus),
    };

    const selectedTemplate = getTemplateForContext({ status, feedback, whats });
    if (!selectedTemplate) return '';

    return formatTemplateMessage({
        template: selectedTemplate,
        greeting,
        customerName,
        values: templateValues,
    });
};

const canSendWhatsAppMessage = ({ status, feedback, whats }: Pick<WhatsAppButtonProps, 'status' | 'feedback' | 'whats'>) => {
    return Boolean(getTemplateForContext({ status, feedback, whats }));
};

const getWhatsAppDisabledReason = ({ phone, status, feedback, whats }: Pick<WhatsAppButtonProps, 'phone' | 'status' | 'feedback' | 'whats'>) => {
    if (!phone || !phone.replace(/\D/g, '')) {
        return 'Cliente sem WhatsApp cadastrado.';
    }

    const currentStatus = normalizeStatus(status);
    if (feedback && !whats?.feedback) {
        return 'Mensagem não configurada para este status.';
    }

    if (currentStatus === STATUS_BUDGET && !whats?.generatedbudget) {
        return 'Mensagem não configurada para este status.';
    }

    if (currentStatus === STATUS_COMPLETED && !whats?.servicecompleted) {
        return 'Mensagem não configurada para este status.';
    }

    if (!canSendWhatsAppMessage({ status, feedback, whats })) {
        return 'Configure uma mensagem padrão para os demais status.';
    }

    return '';
};

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phone, customerName, orderNumber, status, feedback, whats, className }) => {
    const canSend = canSendWhatsAppMessage({ status, feedback, whats });
    const disabledReason = getWhatsAppDisabledReason({ phone, status, feedback, whats });
    const isDisabled = !canSend || Boolean(disabledReason);

    const handleClick = () => {
        if (!phone || !canSend || isDisabled) return;

        const cleanPhone = normalizePhone(phone);

        if (cleanPhone.length < 12) {
            alert('Número de WhatsApp inválido para envio.');
            return;
        }

        const message = buildMessage({
            customerName,
            orderNumber,
            status,
            feedback,
            whats,
        });

        if (!message.trim()) return;

        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

        window.open(url, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            disabled={isDisabled}
            title={isDisabled ? disabledReason : 'Enviar mensagem pelo WhatsApp'}
            className={className || 'rounded-md bg-green-500 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40'}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
            </svg>
        </button>
    );
};
