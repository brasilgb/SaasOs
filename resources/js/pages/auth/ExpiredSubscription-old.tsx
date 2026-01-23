import React from 'react';
import { Head, usePage } from '@inertiajs/react';

export default function ExpiredSubscription({ qr_code, qr_code_base64, payment_id }) {
    const { auth } = usePage().props;

    const copyToClipboard = () => {
        if (qr_code) {
            navigator.clipboard.writeText(qr_code);
            alert('Código Pix copiado!');
        }
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            <Head title="Assinatura Expirada" />

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Assinatura Expirada</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Olá, {auth?.user.name}. Sua assinatura expirou.
                    </p>
                    <p className="text-sm text-gray-600">
                        Para continuar acessando o sistema, realize o pagamento via Pix.
                    </p>
                </div>

                {qr_code_base64 ? (
                    <div className="flex flex-col items-center">
                        <div className="p-2 border rounded mb-4">
                            <img 
                                src={`data:image/png;base64,${qr_code_base64}`} 
                                alt="QR Code Pix" 
                                className="w-48 h-48"
                            />
                        </div>

                        <div className="w-full mb-4">
                            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide font-bold">
                                Copia e Cola
                            </label>
                            <div className="flex">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={qr_code} 
                                    className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-xs"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="bg-gray-800 text-white px-3 py-2 rounded-r-md text-xs font-bold uppercase hover:bg-gray-700"
                                >
                                    Copiar
                                </button>
                            </div>
                        </div>

                        <div className="text-center text-xs text-gray-500">
                            <p>ID do Pagamento: {payment_id}</p>
                            <p className="mt-2">O sistema será liberado automaticamente após a confirmação.</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-red-600 text-sm">
                        Erro ao gerar QR Code. Tente recarregar a página ou contate o suporte.
                    </div>
                )}
            </div>
        </div>
    );
}