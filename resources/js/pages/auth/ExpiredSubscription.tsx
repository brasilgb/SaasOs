import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type ExpiredSubscriptionProps = {
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

export default function ExpiredSubscription(props: ExpiredSubscriptionProps) {
    const { requires_plan, plans = [], qr_code_base64, qr_code, payment_id } = props;

    const [copied, setCopied] = useState(false);
    const [checking, setChecking] = useState(!!payment_id);
    const [attempts, setAttempts] = useState(0);

    const MAX_ATTEMPTS = 60; // ~5 minutos

    const handleCopyPix = () => {
        if (!qr_code) return;

        navigator.clipboard.writeText(qr_code);
        setCopied(true);

        setTimeout(() => setCopied(false), 2500);
    };

    const handleSelectPlan = (planId: number) => {
        router.post(route('payment.select-plan'), {
            plan_id: planId,
        });
    };

    useEffect(() => {
        if (!payment_id) return;

        const interval = setInterval(async () => {
            try {
                setAttempts((prev) => prev + 1);

                const response = await fetch(route('payment.status', payment_id), { credentials: 'same-origin' });

                const data = await response.json();

                if (data.paid) {
                    clearInterval(interval);
                    router.visit('/');
                }

                if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(interval);
                    setChecking(false);
                }
            } catch (error) {
                console.error('Erro ao verificar pagamento:', error);
                clearInterval(interval);
                setChecking(false);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [payment_id, attempts]);

    /* =========================
       SELEÇÃO DE PLANO
    ========================== */
    if (requires_plan) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-900">
                <Head title="Escolha um plano" />

                <div className="w-full max-w-3xl rounded-lg bg-white p-8 text-gray-900 shadow dark:bg-zinc-800 dark:text-gray-100">
                    <h2 className="mb-6 text-center text-2xl font-bold">Escolha um plano para continuar</h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {plans.map((plan) => (
                            <div key={plan.id} className="flex flex-col justify-between rounded-lg border border-gray-200 p-6 dark:border-zinc-700">
                                <div>
                                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                                    <p className="mt-4 text-2xl font-bold">R$ {Number(plan.value).toFixed(2)}</p>
                                </div>

                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className="mt-6 w-full rounded bg-blue-600 py-2 text-white transition hover:bg-blue-700"
                                >
                                    Selecionar plano
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <Link method="post" href={route('logout')} as="button" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
                            Sair do sistema
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================
       TELA PIX
    ========================== */
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-900">
            <Head title="Assinatura expirada" />

            <div className="w-full max-w-md rounded-lg bg-white p-8 text-center text-gray-900 shadow dark:bg-zinc-800 dark:text-gray-100">
                <h2 className="mb-2 text-2xl font-bold">Assinatura expirada</h2>

                <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">Para continuar utilizando o sistema, realize o pagamento via Pix.</p>

                <div className="mb-6 flex justify-center rounded border-2 border-dashed border-gray-300 p-4 dark:border-zinc-600">
                    {qr_code_base64 ? (
                        <img src={`data:image/png;base64,${qr_code_base64}`} className="h-48 w-48 rounded bg-white p-2" alt="QR Code Pix" />
                    ) : (
                        <div className="flex h-48 w-48 items-center justify-center text-gray-400 dark:text-gray-500">Gerando QR Code...</div>
                    )}
                </div>

                <button
                    onClick={handleCopyPix}
                    disabled={!qr_code}
                    className={`w-full rounded py-3 text-white transition ${
                        copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                    }`}
                >
                    {copied ? 'Código Pix copiado!' : 'Copiar código Pix'}
                </button>

                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">A liberação é automática após a confirmação do pagamento.</p>

                {checking ? (
                    <p className="mt-3 text-xs text-blue-600">Verificando pagamento automaticamente...</p>
                ) : (
                    <p className="mt-3 text-xs text-gray-500">Caso já tenha pago, aguarde alguns instantes ou atualize a página.</p>
                )}

                <div className="mt-6 border-t border-gray-200 pt-4 dark:border-zinc-700">
                    <Link method="post" href={route('logout')} as="button" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
                        Sair do sistema
                    </Link>
                </div>
            </div>
        </div>
    );
}
