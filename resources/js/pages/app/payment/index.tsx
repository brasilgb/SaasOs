import AppLayout from '@/layouts/app-layout';
import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type AdvancePayment = {
    requires_plan?: boolean;
    plans?: {
        id: number;
        name: string;
        value: number;
    }[];

    qr_code?: string;
    qr_code_base64?: string;
    payment_id?: string | number;
};

export default function AdvancePayment(props: AdvancePayment) {
    const {
        requires_plan,
        plans = [],
        qr_code_base64,
        qr_code,
        payment_id,
    } = props;

    const [copied, setCopied] = useState(false);
    const [checking] = useState(!!payment_id);

    const handleCopyPix = () => {
        if (!qr_code) return;
        navigator.clipboard.writeText(qr_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleSelectPlan = (planId: number) => {
        router.post(route('payment.select-plan'), {
            plan_id: planId,
            source: 'pay-in-advance',
        });
    };

    useEffect(() => {
        if (!payment_id) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(
                    route('payment.status', payment_id),
                );

                const data = await response.json();

                if (data.paid) {
                    clearInterval(interval);
                    router.visit('/app');
                }
            } catch {}
        }, 5000);

        return () => clearInterval(interval);
    }, [payment_id]);

    return (
        <AppLayout>
            <Head title="Adiantar Pagamento" />

            <Dialog open={requires_plan}>
                <DialogContent className="max-w-3xl" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center mb-6">
                            Escolha um plano para continuar
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan: any) => (
                            <div
                                key={plan.id}
                                className="border border-gray-200 dark:border-zinc-700 rounded-lg p-6 flex flex-col justify-between"
                            >
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {plan.name}
                                    </h3>
                                    <p className="text-2xl font-bold mt-4">
                                        R$ {Number(plan.value).toFixed(2)}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
                                >
                                    Selecionar plano
                                </button>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            <div className="max-w-md w-full mx-auto bg-white dark:bg-zinc-800 p-8 rounded-lg shadow text-center text-gray-900 dark:text-gray-100">
                <h2 className="text-2xl font-bold mb-2">
                    Adiantar Pagamento
                </h2>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Realize o pagamento via Pix para adiantar uma mensalidade.
                </p>

                <div className="flex justify-center mb-6 border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded p-4">
                    {qr_code_base64 ? (
                        <img
                            src={`data:image/png;base64,${qr_code_base64}`}
                            className="w-48 h-48 bg-white p-2 rounded"
                            alt="QR Code Pix"
                        />
                    ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
                            Gerando QR Code...
                        </div>
                    )}
                </div>

                <button
                    onClick={handleCopyPix}
                    disabled={!qr_code}
                    className={`w-full py-3 rounded text-white transition
                        ${
                            copied
                                ? 'bg-green-600'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {copied ? 'Código Pix copiado!' : 'Copiar código Pix'}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    A liberação é automática após a confirmação do pagamento.
                </p>

                {checking && (
                    <p className="text-xs text-blue-600 mt-3">
                        Verificando pagamento automaticamente...
                    </p>
                )}

                <div className="mt-6 border-t border-gray-200 dark:border-zinc-700 pt-4">
                    <Link
                        href={route('app.dashboard')}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
                    >
                        Voltar para o dashboard
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
