import { statusOrdemByValue } from "@/Utils/functions";
import { maskMoney } from "@/Utils/mask";
import { Head } from "@inertiajs/react";

function ServiceOrders({ order }: any) {
    return (
        <>
            <Head title={`OS #${order.order_number}`} />

            <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
                <div className="w-full max-w-xl bg-white rounded-xl shadow-md p-6">

                    {/* Header */}
                    <div className="text-center mb-6">
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

                    {/* Equipamento */}
                    <div className="border-t border-gray-300 pt-4 mb-4">
                        <h2 className="font-semibold text-gray-700 mb-3">
                            Equipamento
                        </h2>

                        <div className="grid grid-cols-2 gap-3 text-sm">

                            <div>
                                <span className="text-gray-500">Tipo de Equipamento</span>
                                <p className="font-medium text-gray-600">{order.equipment.equipment}</p>
                            </div>

                            <div>
                                <span className="text-gray-500">Modelo</span>
                                <p className="font-medium text-gray-600">{order.model}</p>
                            </div>

                            <div>
                                <span className="text-gray-500">Acessórios</span>
                                <p className="font-medium text-gray-600">{order.accessories}</p>
                            </div>

                            <div>
                                <span className="text-gray-500">Estado</span>
                                <p className="font-medium text-gray-600">{order.state_conservation}</p>
                            </div>

                        </div>
                    </div>

                    {/* Defeito */}
                    <div className="border-t border-gray-300 pt-4 mb-4">
                        <h2 className="font-semibold text-gray-700 mb-2">
                            Defeito Relatado
                        </h2>

                        <p className="text-gray-600 text-sm">
                            {order.defect}
                        </p>
                    </div>

                    {/* Orçamento */}
                    <div className="border-t border-gray-300 pt-4 mb-4">
                        <h2 className="font-semibold text-gray-700 mb-2">
                            Orçamento
                        </h2>

                        <p className="text-sm text-gray-600 mb-2 border border-gray-200 rounded-md p-2 bg-gray-50">
                            {order.budget_description}
                        </p>

                        <div>
                            <span className="text-gray-500">Valor do orçamento</span>
                            <p className="font-bold text-lg text-red-600">R$ {maskMoney(order.budget_value)}</p>
                        </div>
                    </div>

                    {/* Serviços executados */}
                    {order.services_performed && (
                        <>
                            <div className="border-t border-gray-300 pt-4 mb-4">
                                <h2 className="font-semibold text-gray-700 mb-2">
                                    Serviços Executados
                                </h2>

                                <p className="text-sm text-gray-600 mb-2 border border-gray-200 rounded-md p-2 bg-gray-50">
                                    {order.services_performed}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-sm pb-4">

                                <div>
                                    <span className="text-gray-500">Valor em peças</span>
                                    <p className="font-medium text-gray-600">R$ {maskMoney(order.parts_value)}</p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Valor do serviço</span>
                                    <p className="font-medium text-gray-600">R$ {maskMoney(order.parts_value)}</p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Valor total</span>
                                    <p className="font-bold text-lg text-green-600">R$ {maskMoney(order.service_cost)}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Previsão */}
                    <div className="border-t border-gray-300 pt-4">
                        <h2 className="font-semibold text-gray-700 mb-2">
                            Previsão de Entrega
                        </h2>

                        <p className="text-sm text-gray-600">
                            {order.delivery_forecast
                                ? new Date(order.delivery_forecast).toLocaleDateString("pt-BR")
                                : "Não definida"
                            }
                        </p>
                    </div>

                </div>
            </div>
        </>
    )
}

export default ServiceOrders