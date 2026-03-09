import Timeline from "@/components/timeline";
import { statusOrdemByValue } from "@/Utils/functions";
import { maskMoney } from "@/Utils/mask";
import { Head, usePage } from "@inertiajs/react";

interface Order {
    order_number: number
    service_status: number
    created_at: string
    delivery_forecast?: string
    model?: string
    accessories?: string
    state_conservation?: string
    defect?: string
    budget_value?: number
    budget_description?: string
    services_performed?: string
    parts_value?: number
    service_value?: number
    service_cost?: number
    customer?: { name: string }
    company?: { logo?: string; whatsapp?: string }
    equipment?: { equipment: string }
}

function ServiceOrders({ order }: { order: Order }) {
const { company } = usePage().props as any;
    function getRemainingTime(deliveryDate?: string) {
        if (!deliveryDate) return null;

        const today = new Date();
        const delivery = new Date(deliveryDate);

        const diff = delivery.getTime() - today.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return "Prazo expirado";
        if (days === 0) return "Concluir hoje";
        return `${days} dias restantes`;
    }

    function remainingColor(text: string) {
        if (text === "Prazo expirado") return "text-red-500";
        if (text === "Concluir hoje") return "text-yellow-500";
        return "text-blue-600";
    }

    const remaining = getRemainingTime(order.delivery_forecast);

    return (
        <>
            <Head title={`OS #${order.order_number}`} />

            <div className="shadow-sm py-4">
                <div className="max-w-4xl mx-auto px-4">
                    <Timeline status={Number(order.service_status)} />
                </div>
            </div>

            <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">

                <div className="w-full max-w-xl bg-white rounded-xl shadow-md p-6">

                    {/* Header */}
                    <div className="text-center mb-6">

                        {company?.logo && (
                            <img
                                src={`/storage/logos/${company?.logo}`}
                                className="mx-auto h-12 mb-3"
                            />
                        )}

                        <h1 className="text-2xl font-bold text-gray-800">
                            Ordem de Serviço #{order.order_number}
                        </h1>

                        <p className="text-sm text-gray-500">
                            Aberta em {new Date(order.created_at).toLocaleDateString("pt-BR")}
                        </p>
                    </div>


                    {/* Status */}
                    <div className="flex justify-center mb-6">
                        <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                            {statusOrdemByValue(order.service_status)}
                        </span>
                    </div>

                    {/* Cliente */}
                    {order.customer?.name && (
                        <div className="border-t border-gray-200 pt-4 mb-4">
                            <h2 className="font-semibold text-gray-700 mb-2">
                                Cliente
                            </h2>

                            <p className="text-gray-600 text-sm">
                                {order.customer.name}
                            </p>
                        </div>
                    )}

                    {/* Equipamento */}
                    <div className="border-t border-gray-200 pt-4 mb-4">
                        <h2 className="font-semibold text-gray-700 mb-3">
                            Equipamento
                        </h2>

                        <div className="grid grid-cols-2 gap-3 text-sm">

                            <div>
                                <span className="text-gray-500">Tipo</span>
                                <p className="font-medium text-gray-700">
                                    {order.equipment?.equipment}
                                </p>
                            </div>

                            <div>
                                <span className="text-gray-500">Modelo</span>
                                <p className="font-medium text-gray-700">
                                    {order.model || "-"}
                                </p>
                            </div>

                            <div>
                                <span className="text-gray-500">Acessórios</span>
                                <p className="font-medium text-gray-700">
                                    {order.accessories || "-"}
                                </p>
                            </div>

                            <div>
                                <span className="text-gray-500">Estado</span>
                                <p className="font-medium text-gray-700">
                                    {order.state_conservation || "-"}
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Defeito */}
                    {order.defect && (
                        <div className="border-t border-gray-200 pt-4 mb-4">
                            <h2 className="font-semibold text-gray-700 mb-2">
                                Defeito Relatado
                            </h2>

                            <p className="text-gray-600 text-sm">
                                {order.defect}
                            </p>
                        </div>
                    )}

                    {/* Orçamento */}
                    {order.budget_value && (
                        <div className="border-t border-gray-200 pt-4 mb-4">
                            <h2 className="font-semibold text-gray-700 mb-2">
                                Orçamento
                            </h2>

                            {order.budget_description && (
                                <p className="text-sm text-gray-600 mb-3 border border-gray-200 rounded-md p-3 bg-gray-50">
                                    {order.budget_description}
                                </p>
                            )}

                            <div>
                                <span className="text-gray-500 text-sm">
                                    Valor do orçamento
                                </span>

                                <p className="font-bold text-lg text-red-600">
                                    R$ {maskMoney(order.budget_value)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Serviços executados */}
                    {order.services_performed && (
                        <>
                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <h2 className="font-semibold text-gray-700 mb-2">
                                    Serviços Executados
                                </h2>

                                <p className="text-sm text-gray-600 mb-3 border border-gray-200 rounded-md p-3 bg-gray-50">
                                    {order.services_performed}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-sm pb-4">

                                <div>
                                    <span className="text-gray-500">Peças</span>
                                    <p className="font-medium text-gray-700">
                                        R$ {maskMoney(order.parts_value || 0)}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Serviço</span>
                                    <p className="font-medium text-gray-700">
                                        R$ {maskMoney(order.service_value || 0)}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Total</span>
                                    <p className="font-bold text-lg text-green-600">
                                        R$ {maskMoney(order.service_cost || 0)}
                                    </p>
                                </div>

                            </div>
                        </>
                    )}

                    {/* Previsão */}
                    <div className="border-t border-gray-200 pt-4 mb-6">
                        <h2 className="font-semibold text-gray-700 mb-2">
                            Previsão de Entrega
                        </h2>

                        <p className="text-sm text-gray-600">
                            {order.delivery_forecast
                                ? new Date(order.delivery_forecast).toLocaleDateString("pt-BR")
                                : "Não definida"}
                        </p>

                        {remaining && (
                            <p className={`text-sm mt-1 font-medium ${remainingColor(remaining)}`}>
                                {remaining}
                            </p>
                        )}
                    </div>

                    {/* WhatsApp */}
                    {order.company?.whatsapp && (
                        <div className="text-center mt-6">

                            <a
                                href={`https://wa.me/${order.company.whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium"
                            >
                                Falar com a assistência
                            </a>

                        </div>
                    )}

                </div>
            </div>
        </>
    )
}

export default ServiceOrders