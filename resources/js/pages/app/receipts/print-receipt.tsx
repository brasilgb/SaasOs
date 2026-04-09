import { Button } from '@/components/ui/button';
import { maskMoney } from '@/Utils/mask';
import { Link } from '@inertiajs/react';
import { pdf } from '@react-pdf/renderer';
import { ArrowLeft, Printer, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import OrderReceiptPDF from './pdf/OrderReceiptPDF';

function ReceiptCopy({
    order,
    company,
    type,
    receipt,
    checklist,
    qrcode,
}: {
    order: any;
    company: any;
    type: string;
    receipt: any;
    checklist: any;
    qrcode: boolean;
}) {
    const listchec = checklist && (checklist?.checklist).split(',');

    const option = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    } as const;
    const locale = 'pt-BR';

    return (
        <div className="flex h-[50vh] flex-col justify-between border-b-2 border-dashed border-gray-400 p-6 text-gray-700 print:border-black">
            {/* Cabeçalho */}
            <div className="mb-1.5 bg-gray-100 py-0.5 text-center text-[10px] font-semibold text-gray-500 uppercase">
                {type === 'oraberta' && 'Recibo de Entrada de Equipamento'}
                {type === 'orentrega' && 'Recibo de Entrega de Equipamento'}
                {type === 'ororcamento' && 'Recibo de geração de orçamento'}
                {type === 'orchecklist' && 'Checklist para Entrega do Equipamento'}
            </div>
            <div className="mb-1.5 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 print:bg-gray-300">
                    <span className="text-[10px] font-bold">
                        <img src={`${company?.logo ? `/storage/logos/${company?.logo}` : '/images/default.png'}`} alt="" />
                    </span>
                </div>
                <div className="flex flex-1 items-center justify-around gap-4 text-[10px]">
                    <div className="grid w-full md:grid-cols-2">
                        <div className="flex flex-1 flex-col items-center">
                            <span className="font-medium">{company?.companyname}</span>
                            <span className="font-medium">{company?.cnpj}</span>
                        </div>
                        <div className="flex flex-1 flex-col items-center">
                            <span className="font-medium">
                                {company?.street}, {company?.number} - {company?.district}
                            </span>
                            <span className="font-medium">
                                {company?.city} - {company?.telephone}
                            </span>
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
                <h2 className="mb-1.5 border-b border-gray-100 bg-gray-50 p-1 text-[10px] font-semibold">Dados do Cliente</h2>
                <div className="grid md:grid-cols-2">
                    <div className="grid gap-1 text-[10px] md:grid-cols-1">
                        <p>
                            <span className="font-medium">Nome cliente:</span> {order?.customer?.name}
                        </p>
                        <p>
                            <span className="font-medium">Endereço:</span> {order?.customer?.street}, {order?.customer?.number} -{' '}
                            {order?.customer?.district}
                        </p>
                    </div>
                    <div className="grid gap-1 text-[10px] md:grid-cols-1">
                        <p>
                            <span className="font-medium">CPF/CNPJ:</span> {order?.customer?.cpfcnpj}
                        </p>
                        <p>
                            <span className="font-medium">Telefone:</span> {order?.customer?.phone}
                        </p>
                    </div>
                </div>
            </div>

            {/* Dados do equipamento */}
            <div className="mb-1.5">
                <h2 className="mb-1.5 border-b border-gray-100 bg-gray-50 p-1 text-[10px] font-semibold">Informações do equipamento</h2>
                <div className="grid text-[10px] md:grid-cols-3">
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
                <p className="flex items-center justify-between gap-2 py-1 text-[10px]">
                    <span className="font-medium">Pré-orçamento: {order?.budget_description}</span>
                    <span className="font-medium">Valor: R$ {order?.budget_value}</span>
                </p>
            </div>

            {/* GArantias e observações */}
            <div className="mb-1.5">
                <h2 className="mb-1.5 border-b border-gray-100 bg-gray-50 p-1 text-[10px] font-semibold">Garantias e/ou observações</h2>
                <div className="rounded-lg bg-gray-50 print:bg-gray-100">
                    <p className="mb-1.5 text-[10px]">
                        {type === 'oraberta' && receipt?.receivingequipment}
                        {type === 'orentrega' && receipt?.equipmentdelivery}
                        {type === 'ororcamento' && receipt?.budgetissuance}
                        {type === 'orchecklist' && 'checklist'}
                    </p>
                </div>
            </div>

            {/* Geraçaõ de checklist */}
            {type === 'orchecklist' && (
                <div className="mb-1.5">
                    <h2 className="mb-1.5 border-b border-gray-100 bg-gray-50 p-1 text-[10px] font-semibold">Checklist</h2>
                    <div className="rounded-lg print:bg-gray-100">
                        <ul className="flex flex-wrap items-center justify-start gap-1">
                            {listchec &&
                                listchec?.map((list: any) => (
                                    <li className="flex items-center gap-2 text-xs">
                                        <Square className="h-3 w-3" /> {list}
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Orçamento gerado */}
            {type === 'ororcamento' && (
                <div className="mb-1.5">
                    <h2 className="mb-1.5 border-b border-gray-100 bg-gray-50 p-1 text-[10px] font-semibold">Orçamento gerado</h2>
                    <div className="rounded-lg bg-gray-50 print:bg-gray-100">
                        <p className="mb-1.5 text-[10px]">{order?.budget_description}</p>
                        <div className="flex items-center justify-between border-t border-gray-300">
                            <div className="flex items-center justify-between gap-2 pt-2"></div>
                            <div className="flex items-center justify-between gap-2 pt-2">
                                <span className="text-xs font-medium">Valor: </span>
                                <span className="text-xs font-bold text-gray-600">R$ {maskMoney(order?.budget_value)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Serviço Prestado */}
            {type === 'orentrega' && (
                <div className="mb-1.5">
                    <h2 className="mb-1.5 border-b border-gray-100 bg-gray-50 p-1 text-[10px] font-semibold">Serviço Prestado</h2>
                    <div className="rounded-lg bg-gray-50 print:bg-gray-100">
                        <p className="mb-1.5 text-[10px]">{order?.services_performed}</p>
                        {order?.order_parts.length > 0 ? (
                            <p className="mb-1.5 text-[10px]">
                                <span className="font-bold">Peças adiciondas: </span>
                                {order?.order_parts.map((part: any) => part.name).join(', ')}
                            </p>
                        ) : (
                            <p className="mb-1.5 text-[10px]">
                                <span className="font-bold">Peças adiciondas: </span>
                                {order?.parts}
                            </p>
                        )}
                        <div className="flex items-center justify-between border-t border-gray-300">
                            <div className="flex items-center justify-between gap-2 pt-2">
                                <span className="text-xs font-medium">Peças: </span>
                                {order?.order_parts.length > 0 ? (
                                    <span className="text-xs font-medium text-gray-600">
                                        R${' '}
                                        {maskMoney(
                                            String(
                                                order?.order_parts.reduce((total: number, part: any) => total + (Number(part.sale_price) || 0), 0),
                                            ),
                                        )}
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-gray-600">R$ {maskMoney(order?.parts_value)}</span>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-2">
                                <span className="text-xs font-medium">Serviço: </span>
                                <span className="text-xs font-medium text-gray-600">R$ {maskMoney(order?.service_value)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-2">
                                <span className="text-xs font-medium">Total: </span>
                                <span className="text-xs font-bold text-gray-600">R$ {maskMoney(order?.service_cost)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rodapé */}
            <div className="mt-auto w-full">
                {type === 'oraberta' && (
                    <div className="flex items-center justify-start gap-2 text-[10px]">
                        <span>
                            Acompanhe o status de sua ordem de serviço em{' '}
                            <span className="text-red-500">https://sigmaos.com.br/os/{order?.tracking_token}</span>
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div className="w-96 text-center text-[10px]">
                        {company?.city}, {new Date().toLocaleDateString(locale, option)}
                    </div>
                    <div className="text-center">
                        <div className="mb-1 w-48 border-t border-black"></div>
                        <p className="text-[10px]">Assinatura do Cliente</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Receipt({ order, company, type, receipt, checklist }: { order: any; company: any; type: any; receipt: any; checklist: any }) {
    const [openAsPdf, setOpenAsPdf] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const query = new URLSearchParams(window.location.search);
        setOpenAsPdf(query.get('pdf') === '1');
    }, []);

    useEffect(() => {
        if (!openAsPdf) return;

        let isMounted = true;
        const generatePdf = async () => {
            setIsGeneratingPdf(true);
            try {
                const blob = await pdf(
                    <OrderReceiptPDF order={order} company={company} type={type} receipt={receipt} checklist={checklist} />,
                ).toBlob();
                if (!isMounted) return;

                const url = URL.createObjectURL(blob);
                window.location.href = url;
                setTimeout(() => URL.revokeObjectURL(url), 60_000);
            } catch (error) {
                console.error('Erro ao gerar recibo em PDF:', error);
                alert('Erro ao gerar recibo em PDF.');
            } finally {
                if (isMounted) setIsGeneratingPdf(false);
            }
        };

        generatePdf();
        return () => {
            isMounted = false;
        };
    }, [openAsPdf, order, company, type, receipt, checklist]);

    if (openAsPdf) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center p-6">
                <p className="text-sm text-muted-foreground">{isGeneratingPdf ? 'Gerando recibo PDF...' : 'Abrindo recibo PDF...'}</p>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };
    return (
        <div className="relative mx-auto max-w-4xl">
            {/* Botão de Impressão - oculto na impressão */}
            <div className="absolute mb-4 flex w-full items-center justify-between print:hidden">
                <Button asChild className="gap-2">
                    <Link href={route('app.orders.index')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <Button onClick={handlePrint} className="gap-2">
                    <Printer className="h-4 w-4" />
                </Button>
            </div>

            {/* Recibo para Impressão */}
            <div className="bg-white shadow-lg print:h-screen print:shadow-none">
                {/* Primeira Via */}
                <ReceiptCopy order={order} company={company} type={type} receipt={receipt} checklist={checklist} qrcode={false} />

                {/* Segunda Via */}
                <ReceiptCopy order={order} company={company} type={type} receipt={receipt} checklist={checklist} qrcode={false} />
            </div>
        </div>
    );
}
