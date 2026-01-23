import React, { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';

type Props = {
    qr_code_base64?: string;
    qr_code?: string;
    payment_id?: number;
};

export default function ExpiredSubscription({
    qr_code_base64,
    qr_code,
    payment_id,
}: Props) {
    const [copied, setCopied] = useState(false);
    const [checking, setChecking] = useState(true);
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const handleCopyPix = () => {
        if (!qr_code) return;

        navigator.clipboard.writeText(qr_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    /**
     * Polling do status do pagamento
     */
    useEffect(() => {
        if (!payment_id) return;

        const interval = setInterval(() => {
            router.get(
                route('payment.status', payment_id),
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    only: [],
                    onSuccess: (page) => {
                        if ((page.props as any)?.paid) {
                            clearInterval(interval);
                            router.visit(route('home'));
                        }
                    },
                }
            );
        }, 5000); // a cada 5 segundos

        return () => clearInterval(interval);
    }, [payment_id]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Assinatura Expirada" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mb-6">
                        <span className="text-red-500 text-6xl">⚠️</span>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">
                            Assinatura Expirada
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Para continuar utilizando o sistema, realize o pagamento via Pix.
                        </p>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center mb-6 border-2 border-dashed border-gray-200 p-4 rounded-xl">
                        {qr_code_base64 ? (
                            <img
                                src={`data:image/png;base64,${qr_code_base64}`}
                                alt="QR Code Pix"
                                className="w-48 h-48"
                            />
                        ) : (
                            <div className="w-48 h-48 bg-gray-200 animate-pulse flex items-center justify-center">
                                Gerando QR Code...
                            </div>
                        )}
                    </div>

                    {/* Botão Copia e Cola */}
                    <div className="space-y-3">
                        <button
                            onClick={handleCopyPix}
                            disabled={!qr_code}
                            className={`w-full py-3 px-4 rounded-md text-sm font-medium text-white transition-colors ${
                                copied
                                    ? 'bg-green-600'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {copied
                                ? 'Código Pix Copiado!'
                                : 'Copiar Código Pix (Copia e Cola)'}
                        </button>

                        <p className="text-xs text-gray-500">
                            A liberação é automática após o pagamento.
                        </p>
                    </div>

                    <div className="mt-6 border-t pt-6">
                        <Link
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            method="post"
                            href={route('logout')}
                            as="button"
                            onClick={handleLogout}
                        >
                            Sair do sistema
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
