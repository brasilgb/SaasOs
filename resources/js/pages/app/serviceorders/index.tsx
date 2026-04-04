import { toastSuccess, toastWarning } from '@/components/app-toast-messages';
import { StatusBadge } from '@/components/StatusBadge';
import Timeline from '@/components/timeline';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { maskMoney } from '@/Utils/mask';
import { Head, router, usePage } from '@inertiajs/react';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';

interface Order {
    id: number;
    order_number: number;
    service_status: number;
    created_at: string;
    delivery_forecast?: string;
    model?: string;
    accessories?: string;
    state_conservation?: string;
    defect?: string;
    budget_value?: number;
    budget_description?: string;
    services_performed?: string;
    parts_value?: number;
    service_value?: number;
    service_cost?: number;
    customer?: { name: string };
    company?: { logo?: string; whatsapp?: string };
    equipment?: { equipment: string };
}

function ServiceOrders({ order }: { order: Order }) {
    const { company } = usePage().props as any;
    const [loadingA, setLoadingA] = useState<boolean>(false);
    const [loadingR, setLoadingR] = useState<boolean>(false);
    function getRemainingTime(deliveryDate?: string) {
        if (!deliveryDate) return null;

        const today = new Date();
        const delivery = new Date(deliveryDate);

        const diff = delivery.getTime() - today.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return 'Prazo expirado';
        if (days === 0) return 'Concluir hoje';
        return `${days} dias restantes`;
    }

    function remainingColor(text: string) {
        if (text === 'Prazo expirado') return 'text-red-500';
        if (text === 'Concluir hoje') return 'text-yellow-500';
        return 'text-blue-600';
    }

    const remaining = getRemainingTime(order.delivery_forecast);

    function budgetAlter(status: 4 | 9) {
        router.post(
            route('orders.budget.status', order.id),
            { status },
            {
                preserveScroll: true,

                onStart: () => (status === 4 ? setLoadingA(true) : setLoadingR(true)),

                onSuccess: () => {
                    toastSuccess('Sucesso', status === 4 ? 'Orçamento aprovado com sucesso' : 'Orçamento recusado com sucesso');
                },

                onError: () => {
                    toastWarning('Erro', 'Não foi possível atualizar o orçamento');
                },

                onFinish: () => (status === 4 ? setLoadingA(false) : setLoadingR(false)),
            },
        );
    }

    // ✔ Aprovar direto
    function handleApprove() {
        budgetAlter(4);
    }

    function handleReject() {
        const confirmed = window.confirm('Deseja realmente recusar o orçamento?');
        if (!confirmed) return;

        budgetAlter(9);
    }

    return (
        <>
            <Toaster />
            <Head title={`OS #${order.order_number}`} />

            <div className="py-4 shadow-sm">
                <div className="mx-auto max-w-4xl px-4">
                    <Timeline status={Number(order.service_status)} />
                </div>
            </div>

            <div className="flex min-h-screen justify-center bg-gray-100 px-4 py-10">
                <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-md">
                    {/* Header */}
                    <div className="mb-6 text-center">
                        {company?.logo && <img src={`/storage/logos/${company?.logo}`} className="mx-auto mb-3 h-12" />}

                        <h1 className="text-2xl font-bold text-gray-800">Ordem de Serviço #{order.order_number}</h1>

                        <p className="text-sm text-gray-500">Aberta em {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>

                    {/* Status */}
                    <div className="mb-4 flex justify-center">
                        {<StatusBadge category="ordem" value={order.service_status} className="px-4 py-2" />}
                    </div>
                    {order.service_status === 3 && (
                        <div className="mb-6 flex flex-1 items-center justify-center">
                            <InfoIcon className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-normal text-red-600 italic">Aguardando aprovação</span>
                        </div>
                    )}
                    {/* Cliente */}
                    {order.customer?.name && (
                        <div className="mb-4 border-t border-gray-200 pt-4">
                            <h2 className="mb-2 font-semibold text-gray-700">Cliente</h2>

                            <p className="text-sm text-gray-600">{order.customer.name}</p>
                        </div>
                    )}

                    {/* Equipamento */}
                    <div className="mb-4 border-t border-gray-200 pt-4">
                        <h2 className="mb-3 font-semibold text-gray-700">Equipamento</h2>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500">Tipo</span>
                                <p className="font-medium text-gray-700">{order.equipment?.equipment}</p>
                            </div>

                            <div>
                                <span className="text-gray-500">Modelo</span>
                                <p className="font-medium text-gray-700">{order.model || '-'}</p>
                            </div>

                            <div>
                                <span className="text-gray-500">Acessórios</span>
                                <p className="font-medium text-gray-700">{order.accessories || '-'}</p>
                            </div>

                            <div>
                                <span className="text-gray-500">Estado</span>
                                <p className="font-medium text-gray-700">{order.state_conservation || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Defeito */}
                    {order.defect && (
                        <div className="mb-4 border-t border-gray-200 pt-4">
                            <h2 className="mb-2 font-semibold text-gray-700">Defeito Relatado</h2>

                            <p className="text-sm text-gray-600">{order.defect}</p>
                        </div>
                    )}

                    {/* Orçamento */}
                    {order.budget_description && order.budget_value && (
                        <div className="mb-4 border-t border-gray-200 pt-4">
                            <h2 className="mb-2 font-semibold text-gray-700">Orçamento</h2>

                            {order.budget_description && (
                                <p className="mb-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                                    {order.budget_description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-4">
                                {/* Valor */}
                                <div>
                                    <span className="text-sm text-gray-500">Valor do orçamento</span>

                                    <p className="text-lg font-bold text-red-600">R$ {maskMoney(String(order.budget_value ?? ''))}</p>
                                </div>

                                {/* Ações */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={handleApprove}
                                        disabled={loadingA || order.service_status === 4}
                                        className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                        {loadingA ? 'Aprovando...' : 'Aprovar'}
                                    </Button>

                                    <Button
                                        onClick={handleReject}
                                        disabled={loadingR || order.service_status === 5}
                                        className="bg-red-600 text-white hover:bg-red-700"
                                    >
                                        {loadingR ? 'Reprovando...' : 'Reprovar'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Serviços executados */}
                    {order.services_performed && (
                        <>
                            <div className="mb-4 border-t border-gray-200 pt-4">
                                <h2 className="mb-2 font-semibold text-gray-700">Serviços Executados</h2>

                                <p className="mb-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                                    {order.services_performed}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 pb-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Peças</span>
                                    <p className="font-medium text-gray-700">R$ {maskMoney(String(order.parts_value || 0))}</p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Serviço</span>
                                    <p className="font-medium text-gray-700">R$ {maskMoney(String(order.service_value || 0))}</p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Total</span>
                                    <p className="text-lg font-bold text-green-600">R$ {maskMoney(String(order.service_cost || 0))}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Previsão */}
                    <div className="mb-6 border-t border-gray-200 pt-4">
                        <h2 className="mb-2 font-semibold text-gray-700">Previsão de Entrega</h2>

                        <p className="text-sm text-gray-600">
                            {order.delivery_forecast ? new Date(order.delivery_forecast).toLocaleDateString('pt-BR') : 'Não definida'}
                        </p>

                        {remaining && <p className={`mt-1 text-sm font-medium ${remainingColor(remaining)}`}>{remaining}</p>}
                    </div>

                    {/* WhatsApp */}
                    {order.company?.whatsapp && (
                        <div className="mt-6 text-center">
                            <a
                                href={`https://wa.me/${order.company.whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg bg-green-500 px-5 py-2 text-sm font-medium text-white hover:bg-green-600"
                            >
                                Falar com a assistência
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ServiceOrders;
