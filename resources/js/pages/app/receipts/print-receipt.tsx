import { Button } from "@/components/ui/button"
import { maskMoney } from "@/Utils/mask";
import { Link } from "@inertiajs/react"
import { ArrowLeft, Printer, Square } from "lucide-react"

function ReceiptCopy({ order, company, type, receipt, checklist, qrcode }: { order: any; company: any; type: string, receipt: any, checklist: any, qrcode: boolean }) {

    const listchec = checklist && (checklist?.checklist).split(',');

    const option = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    } as const;
    const locale = 'pt-BR';

    return (
        <div className="h-[50vh] p-6 border-b-2 border-dashed border-gray-400 print:border-black flex flex-col justify-between text-gray-700">
            {/* Cabeçalho */}
            <div className="text-[10px] text-center uppercase font-semibold text-gray-500 bg-gray-100 mb-1.5 py-0.5">
                {type === 'oraberta' && 'Recibo de Entrada de Equipamento'}
                {type === 'orentrega' && 'Recibo de Entrega de Equipamento'}
                {type === 'ororcamento' && 'Recibo de geração de orçamento'}
                {type === 'orchecklist' && 'Checklist para Entrega do Equipamento'}
            </div>
            <div className="flex justify-between items-start mb-1.5">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center print:bg-gray-300">
                    <span className="text-[10px] font-bold">
                        <img src={`/storage/logos/${company?.logo ? company?.logo : "default.png"}`} alt="" />
                    </span>
                </div>
                <div className="flex-1 flex items-center justify-around gap-4 text-[10px]">
                    <div className="grid md:grid-cols-2 w-full">
                        <div className="flex flex-1 flex-col items-center">
                            <span className="font-medium">{company?.companyname}</span>
                            <span className="font-medium">{company?.cnpj}</span>
                        </div>
                        <div className="flex flex-1 flex-col items-center">
                            <span className="font-medium">{company?.street}, {company?.number} - {company?.district}</span>
                            <span className="font-medium">{company?.city} - {company?.telephone}</span>
                        </div>
                    </div>
                </div>
                <div className="flex-none">
                    <p className="text-[10px] font-bold">O.S</p>
                    <p className="text-[10px] font-bold text-blue-600">#{order.order_number}</p>
                </div>
            </div>

            {/* Dados do cliente */}
            <div className="mb-1.5">
                <h2 className="text-[10px] font-semibold mb-1.5 border-b border-gray-100 p-1 bg-gray-50">Dados do Cliente</h2>
                <div className="grid md:grid-cols-2">
                    <div className="grid md:grid-cols-1 gap-1 text-[10px]">
                        <p>
                            <span className="font-medium">Nome cliente:</span> {order?.customer?.name}
                        </p>
                        <p>
                            <span className="font-medium">Endereço:</span> {order?.customer?.street}, {order?.customer?.number} - {order?.customer?.district}
                        </p>
                    </div>
                    <div className="grid md:grid-cols-1 gap-1 text-[10px]">
                        <p>
                            <span className="font-medium">CPF/CNPJ:</span> {order?.customer?.cpf}
                        </p>
                        <p>
                            <span className="font-medium">Telefone:</span> {order?.customer?.phone}
                        </p>
                    </div>
                </div>
            </div>

            {/* Dados do equipamento */}
            <div className="mb-1.5">
                <h2 className="text-[10px] font-semibold mb-1.5 border-b border-gray-100 p-1 bg-gray-50">Informações do equipamento</h2>
                <div className="grid md:grid-cols-3 text-[10px]">
                    <p>
                        <span className="font-medium">Equipamento:</span> {order?.equipment?.equipment}
                    </p>
                    <p>
                        <span className="font-medium">Modelo:</span> {order?.model}
                    </p>
                    <p>
                        <span className="font-medium">Defeito:</span> {order?.defect}
                    </p>
                </div>
                <p className="text-[10px] flex items-center justify-between py-1 gap-2">
                    <span className="font-medium">Pré-orçamento: {order?.budget_description}</span>
                    <span className="font-medium">Valor: R$ {order?.budget_value}</span>
                </p>
            </div>

            {/* GArantias e observações */}
            <div className="mb-1.5">
                <h2 className="text-[10px] font-semibold mb-1.5 border-b border-gray-100 p-1 bg-gray-50">Garantias e/ou observações</h2>
                <div className="bg-gray-50 rounded-lg print:bg-gray-100">
                    <p className="text-[10px] mb-1.5">
                        {type === 'oraberta' && receipt?.receivingequipment}
                        {type === 'orentrega' && receipt?.equipmentdelivery}
                        {type === 'ororcamento' && receipt?.budgetissuance}
                        {type === 'orchecklist' && 'checklist'}
                    </p>
                </div>
            </div>

            {/* Geraçaõ de checklist */}
            {type === 'orchecklist' &&
                <div className="mb-1.5">
                    <h2 className="text-[10px] font-semibold mb-1.5 border-b border-gray-100 p-1 bg-gray-50">Checklist</h2>
                    <div className="rounded-lg print:bg-gray-100">
                        <ul className="flex flex-wrap items-center justify-start gap-1">
                            {listchec && listchec?.map((list: any) => (
                                <li className="flex items-center gap-2 text-xs"><Square className="h-3 w-3" /> {list}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            }

            {/* Orçamento gerado */}
            {type === 'ororcamento' &&
                <div className="mb-1.5">
                    <h2 className="text-[10px] font-semibold mb-1.5 border-b border-gray-100 p-1 bg-gray-50">Orçamento gerado</h2>
                    <div className="bg-gray-50 rounded-lg print:bg-gray-100">
                        <p className="text-[10px] mb-1.5">{order?.budget_description}</p>
                        <div className="flex items-center justify-between border-t border-gray-300">
                            <div className="flex justify-between items-center pt-2 gap-2">
                            </div>
                            <div className="flex justify-between items-center pt-2 gap-2">
                                <span className="font-medium text-xs">Valor: </span>
                                <span className="text-xs font-bold text-gray-600">R$ {maskMoney(order?.budget_value)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            }

            {/* Serviço Prestado */}
            {type === 'orentrega' &&
                <div className="mb-1.5">
                    <h2 className="text-[10px] font-semibold mb-1.5 border-b border-gray-100 p-1 bg-gray-50">Serviço Prestado</h2>
                    <div className="bg-gray-50 rounded-lg print:bg-gray-100">
                        <p className="text-[10px] mb-1.5">{order?.services_performed}</p>
                        {order?.order_parts.length > 0 ?
                            <p className="text-[10px] mb-1.5"><span className="font-bold">Peças adiciondas: </span>
                                {
                                    order?.order_parts.map((part: any) => part.name).join(', ')
                                }
                            </p>
                            : <p className="text-[10px] mb-1.5"><span className="font-bold">Peças adiciondas: </span>{order?.parts}</p>
                        }
                        <div className="flex items-center justify-between border-t border-gray-300">
                            <div className="flex justify-between items-center pt-2 gap-2">
                                <span className="font-medium text-xs">Peças: </span>
                                {order?.order_parts.length > 0 ?
                                    <span className="text-xs font-medium text-gray-600">R$ {maskMoney(String(order?.order_parts.reduce(
                                        (total: number, part: any) => total + (Number(part.sale_price) || 0),
                                        0
                                    )))}
                                    </span>
                                    : <span className="text-xs font-medium text-gray-600">R$ {maskMoney(order?.parts_value)}</span>
                                }
                            </div>
                            <div className="flex justify-between items-center pt-2 gap-2">
                                <span className="font-medium text-xs">Serviço: </span>
                                <span className="text-xs font-medium text-gray-600">R$ {maskMoney(order?.service_value)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 gap-2">
                                <span className="font-medium text-xs">Total: </span>
                                <span className="text-xs font-bold text-gray-600">R$ {maskMoney(order?.service_cost)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            }

            {/* Rodapé */}
            <div className="mt-auto">
                <div className="flex justify-between items-center">
                    <div className="text-[10px] text-center w-96">
                        {company?.city}, {new Date().toLocaleDateString(locale, option)}
                    </div>
                    {qrcode && type === 'oraberta' &&
                        <div className="flex items-center justify-center text-[10px] gap-2">
                            <span>Acompanhe o status de  sua ordem de serviço em  https://eplusteutonia.com.br/painel ou (área do cliente), Usuário: CPF/CNPJ - senha: 12345678 <span className="text-red-500">Após logar altere sua senha.</span></span>
                            <img className="w-24" src="/qrcode.jpeg" alt="QRCode Eplus" />
                        </div>
                    }
                    <div className="text-center">
                        <div className="border-t border-black w-48 mb-1"></div>
                        <p className="text-[10px]">Assinatura do Cliente</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Receipt({ order, company, type, receipt, checklist }: { order: any; company: any; type: any, receipt: any, checklist: any }) {
    const handlePrint = () => {
        window.print()
    }
    return (
        <div className="max-w-4xl mx-auto relative">
            {/* Botão de Impressão - oculto na impressão */}
            <div className="mb-4 print:hidden flex items-center justify-between absolute w-full">
                <Button asChild className="gap-2">
                    <Link href={route('app.orders.index')} >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <Button onClick={handlePrint} className="gap-2">
                    <Printer className="h-4 w-4" />
                </Button>
            </div>

            {/* Recibo para Impressão */}
            <div className="bg-white shadow-lg print:shadow-none print:h-screen">
                {/* Primeira Via */}
                <ReceiptCopy order={order} company={company} type={type} receipt={receipt} checklist={checklist} qrcode={false} />

                {/* Segunda Via */}
                <ReceiptCopy order={order} company={company} type={type} receipt={receipt} checklist={checklist} qrcode={false} />
            </div>
        </div>
    )
}
