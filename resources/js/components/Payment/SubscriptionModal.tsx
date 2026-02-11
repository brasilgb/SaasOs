import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function SubscriptionModal() {
    const { subscription_alert, plans } = usePage().props as any;
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [pixData, setPixData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const COOLDOWN_HOURS = 3;

    // 1. Lógica de Controle de Abertura (Cooldown + Manual)
    useEffect(() => {
        const checkAndOpen = () => {
            if (subscription_alert?.status === 'grace_period') {
                const lastShown = localStorage.getItem('subscription_modal_last_shown');
                const now = new Date().getTime();
                const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;

                if (!lastShown || now - parseInt(lastShown) > cooldownMs) {
                    setIsOpen(true);
                    localStorage.setItem('subscription_modal_last_shown', now.toString());
                }
            }
        };

        // Roda ao carregar ou trocar de rota (via subscription_alert)
        checkAndOpen();

        // Listener para abertura manual (vindo do Banner)
        const openManual = () => setIsOpen(true);
        window.addEventListener('open-subscription-modal', openManual);

        return () => window.removeEventListener('open-subscription-modal', openManual);
    }, [subscription_alert]); // O Inertia atualiza isso em cada navegação

    // 2. Polling do Status do Pagamento
    useEffect(() => {
        let interval: any = null;

        if (pixData && !isChecking) {
            setIsChecking(true);
            interval = setInterval(async () => {
                try {
                    const response = await axios.get(route('subscription.check_status'));
                    if (response.data.status === 'active') {
                        clearInterval(interval);
                        window.location.href = route('app.dashboard');
                    }
                } catch (error) {
                    console.error("Erro ao verificar status", error);
                }
            }, 5000);
        }

        return () => { if (interval) clearInterval(interval); };
    }, [pixData]);

    const handleGeneratePix = async () => {
        if (!selectedPlan) return;
        setLoading(true);
        try {
            const response = await axios.post(route('subscription.generate_pix'), {
                plan_id: selectedPlan
            });
            setPixData(response.data);
        } catch (error: any) {
            console.error("Erro ao gerar PIX", error);
        } finally {
            setLoading(false);
        }
    };

    // Renderização Condicional (Abaixo de todos os Hooks)
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">

                <h2 className="text-xl font-bold text-red-600 mb-2">Assinatura Pendente</h2>

                <p className="mb-4 text-gray-600">
                    Sua assinatura venceu há <strong>{Math.floor(subscription_alert?.days_overdue || 0)}</strong> dias.
                    Você tem <strong>{Math.max(0, Math.ceil(3 - (subscription_alert?.days_overdue || 0)))}</strong> dias de cortesia restantes.
                </p>

                {pixData && (
                    <div className="mb-4 flex items-center justify-center text-blue-600 animate-pulse bg-blue-50 p-2 rounded">
                        <span className="text-sm font-medium">Aguardando confirmação do banco...</span>
                    </div>
                )}

                {!pixData ? (
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Escolha um plano:</label>

                        {(!plans || plans.length === 0) && (
                            <p className="text-sm text-red-500 bg-red-50 p-2 rounded">Nenhum plano disponível.</p>
                        )}

                        {plans?.filter((p: any) => parseFloat(p.value) > 0).map((plan: any) => (
                            <div key={plan.id}
                                className={`border p-3 rounded cursor-pointer transition flex justify-between items-center ${selectedPlan === plan.id
                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                    : 'hover:bg-gray-50 border-gray-200'
                                    }`}
                                onClick={() => setSelectedPlan(plan.id)}>
                                <div>
                                    <div className="font-bold text-gray-800">{plan.name}</div>
                                    <div className="text-xs text-gray-500">{plan.description}</div>
                                </div>
                                <div className="font-semibold text-blue-600">
                                    R$ {parseFloat(plan.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={handleGeneratePix}
                            disabled={!selectedPlan || loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 disabled:opacity-50 font-bold">
                            {loading ? 'Processando...' : 'Gerar PIX'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <img src={`data:image/png;base64,${pixData.qr_code}`} alt="QR Code" className="mx-auto w-48 h-48 border p-2 mb-4" />
                        <input type="text" readOnly value={pixData.qr_code_copy_paste} className="w-full text-xs border p-2 bg-gray-50" />
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(pixData.qr_code_copy_paste);
                                alert('Código Copiado!');
                            }}
                            className="text-blue-600 text-sm mt-2 underline block mx-auto">
                            Copiar Código PIX
                        </button>
                    </div>
                )}

                <button onClick={() => setIsOpen(false)} className="mt-6 text-gray-400 text-sm underline w-full text-center">
                    Fechar e pagar depois
                </button>
            </div>
        </div>
    );
}