import { toastWarning } from '@/components/app-toast-messages';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

type FlashMessages = {
    authorization_error?: string;
};

export function FlashToastMessages() {
    const { flash } = usePage<{ flash?: FlashMessages }>().props;

    useEffect(() => {
        if (flash?.authorization_error) {
            toastWarning('Ação não autorizada', flash.authorization_error);
        }
    }, [flash?.authorization_error]);

    useEffect(() => {
        const handleInvalidResponse = (event: Event) => {
            const response = (event as CustomEvent<{ response?: { status?: number } }>).detail?.response;

            if (response?.status === 403) {
                event.preventDefault();
                toastWarning('Ação não autorizada', 'Esta ação não é autorizada.');
            }
        };

        const handleException = (event: Event) => {
            const exception = (event as CustomEvent<{ exception?: { response?: { status?: number } } }>).detail?.exception;

            if (exception?.response?.status === 403) {
                event.preventDefault();
                toastWarning('Ação não autorizada', 'Esta ação não é autorizada.');
            }
        };

        document.addEventListener('inertia:invalid', handleInvalidResponse);
        document.addEventListener('inertia:exception', handleException);

        return () => {
            document.removeEventListener('inertia:invalid', handleInvalidResponse);
            document.removeEventListener('inertia:exception', handleException);
        };
    }, []);

    return null;
}
