import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react'; // "router" substitui "Inertia" nas versoes novas
import axios from 'axios';

export default function Blocked({ plans, tenant }: any) {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pixData, setPixData] = useState<any>(null);
    const [isChecking, setIsChecking] = useState(false);

    // Efeito de Polling: Verifica status a cada 5 segundos se estiver aguardando pagamento
    useEffect(() => {
        let interval: any = null;

        // Só inicia o polling se houver um QR Code na tela
        if (pixData && !isChecking) {
            setIsChecking(true);

            interval = setInterval(async () => {
                try {
                    const response = await axios.get(route('subscription.check_status'));

                    if (response.data.status === 'active') {
                        // 1. Limpa o intervalo imediatamente
                        clearInterval(interval);
                        // window.location.reload() é mais seguro para resetar todos os middlewares
                        window.location.href = route('app.dashboard');
                    }
                } catch (error) {
                    console.error("Erro ao verificar status do pagamento", error);
                    // Opcional: parar o polling se der erro 500 repetidamente
                }
            }, 5000); // 5 segundos é o padrão ideal para o Mercado Pago
        }

        // CLEANUP: Limpa o intervalo se o usuário fechar o modal ou sair da página
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [pixData]);

    const handleGeneratePix = async () => {
        if (!selectedPlan) return;
        setLoading(true);

        try {
            const response = await axios.post(route('subscription.pay'), {
                plan_id: selectedPlan
            });

            setPixData(response.data);
            setIsChecking(true); // Inicia o polling
            console.log(response);
            
        } catch (error) {
            alert('Erro ao gerar pagamento. Tente novamente.');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = (e: any) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Acesso Bloqueado" />

            {pixData && (
                <div className="mt-4 flex flex-col items-center">
                    <div className="flex items-center text-blue-600 animate-pulse">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">Aguardando confirmação do banco...</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 italic">
                        Não é necessário enviar o comprovante, a liberação é automática.
                    </p>
                </div>
            )}

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                {/* Ícone de Cadeado ou Alerta */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Acesso Suspenso
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Olá, <span className="font-bold">{tenant.name}</span>. Identificamos pendências financeiras.
                    Para reativar seu acesso instantaneamente, escolha um plano abaixo.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                    {/* SELEÇÃO DE PLANO */}
                    {!pixData ? (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Selecione uma opção de renovação:
                            </label>

                            <div className="grid grid-cols-1 gap-4">
                                {plans.map((plan: any) => (
                                    <div
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={`relative rounded-lg border p-4 shadow-sm flex cursor-pointer focus:outline-none 
                                            ${selectedPlan === plan.id ? 'ring-2 ring-indigo-500 border-transparent bg-indigo-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                                    >
                                        <div className="flex-1 flex justify-between">
                                            <div>
                                                <span className="block text-sm font-medium text-gray-900">
                                                    {plan.name}
                                                </span>
                                                <span className="block text-sm text-gray-500">
                                                    {plan.description}
                                                </span>
                                            </div>
                                            <div className="text-sm font-bold text-gray-900">
                                                R$ {plan.value}
                                            </div>
                                        </div>
                                        {selectedPlan === plan.id && (
                                            <div className="absolute -top-2 -right-2 bg-indigo-600 rounded-full p-1">
                                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleGeneratePix}
                                disabled={!selectedPlan || loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mt-6"
                            >
                                {loading ? 'Gerando Cobrança...' : 'Gerar QR Code PIX'}
                            </button>
                        </div>
                    ) : (

                        /* PAGAMENTO PIX */
                        <div className="text-center animate-fade-in-up">
                            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                                <p className="text-green-800 font-medium">Cobrança gerada com sucesso!</p>
                                <p className="text-green-600 text-sm">Aguardando confirmação automática...</p>
                            </div>

                            <img
                                src={`data:image/png;base64,${pixData.qr_code}`}
                                alt="QR Code"
                                className="mx-auto w-64 h-64 border p-2 rounded"
                            />

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">Copia e Cola</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        readOnly
                                        value={pixData.qr_code_copy_paste}
                                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-xs border-gray-300 bg-gray-50 p-2"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(pixData.qr_code_copy_paste);
                                            alert('Código copiado!');
                                        }}
                                        className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <span>Copiar</span>
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-center">
                                <svg className="animate-spin h-5 w-5 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-gray-500 text-sm">Verificando pagamento...</span>
                            </div>

                            <button
                                onClick={() => setPixData(null)}
                                className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                                Escolher outro plano
                            </button>
                        </div>
                    )}
                </div>

                {/* BOTÃO DE LOGOUT */}
                <div className="mt-6 text-center">
                    <form onSubmit={handleLogout}>
                        <button
                            type="submit"
                            className="text-sm text-gray-500 hover:text-gray-900 font-medium underline"
                        >
                            Sair da conta
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}