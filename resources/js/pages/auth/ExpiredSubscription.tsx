import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { LogOut } from 'lucide-react';

export default function ExpiredSubscription({ pix_code_base64, pix_copy_paste }: any) {
    const [copied, setCopied] = useState(false);
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const handleCopyPix = () => {
        navigator.clipboard.writeText(pix_copy_paste);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Assinatura Expirada" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mb-6">
                        <span className="text-red-500 text-6xl">⚠️</span>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">Assinatura Expirada</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Seu acesso ao SigmaOS expirou. Para continuar utilizando, realize o pagamento via Pix abaixo.
                        </p>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center mb-6 border-2 border-dashed border-gray-200 p-4 rounded-xl">
                        {pix_code_base64 ? (
                            <img
                                src={`data:image/png;base64,${pix_code_base64}`}
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
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                                } focus:outline-none transition-colors`}
                        >
                            {copied ? '✅ Código Copiado!' : '📋 Copiar Código Pix (Copia e Cola)'}
                        </button>

                        <p className="text-xs text-gray-500">
                            A liberação é automática após o pagamento.
                        </p>
                    </div>

                    <div className="mt-6 border-t pt-6">
                        <Link className="text-sm font-medium text-blue-600 hover:text-blue-500" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                            <LogOut className="mr-2" />
                            Log out
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}