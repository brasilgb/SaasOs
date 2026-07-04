import { toast } from 'sonner';

const lastToast = new Map<string, { signature: string; timestamp: number }>();

function shouldSuppress(type: string, message: string, description?: string) {
    const now = Date.now();
    const signature = `${message}\u0000${description ?? ''}`;
    const previous = lastToast.get(type);

    // Respostas Inertia podem acionar a confirmação local e o flash global
    // praticamente ao mesmo tempo. Uma única confirmação é suficiente.
    const duplicate = previous && now - previous.timestamp < 1200 && (type === 'success' || previous.signature === signature);
    lastToast.set(type, { signature, timestamp: now });

    return Boolean(duplicate);
}

export function toastSuccess(message: string, description?: string) {
    if (shouldSuppress('success', message, description)) return;

    toast.success(message, {
        description,
    });
}

export function toastWarning(message: string, description?: string) {
    if (shouldSuppress('warning', message, description)) return;

    toast.warning(message, {
        description,
    });
}

export function toastError(message: string, description?: string) {
    if (shouldSuppress('error', message, description)) return;

    toast.error(message, {
        description,
    });
}
