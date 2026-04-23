import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { maskCpfCnpj, maskMoney } from '@/Utils/mask';
import { router, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

interface InvoiceModalProps {
    open: boolean;
    onClose: () => void;
    order: {
        id?: string | number;
        customer?: {
            name?: string;
            cpfcnpj?: string;
        };
        services_performed?: string;
        service_cost?: string | number;
        service_value?: string | number;
        parts_value?: string | number;
        order_number?: string | number;
        fiscal_document_number?: string;
        fiscal_document_url?: string;
        fiscal_issued_at?: string;
        fiscal_notes?: string;
    };
    summary?: {
        service_value?: string | number;
        parts_value?: string | number;
        total_order?: string | number;
    } | null;
}

export default function InvoiceModal({ open, onClose, order, summary = null }: InvoiceModalProps) {
    const { fiscalSetting } = usePage<{ fiscalSetting?: { enabled?: boolean; nfse_enabled?: boolean; has_api_token?: boolean } | null }>().props;
    const focusEnabled = Boolean(fiscalSetting?.enabled && fiscalSetting?.nfse_enabled && fiscalSetting?.has_api_token);
    const orderId = order?.id;
    const partsValue = Number(summary?.parts_value ?? order.parts_value ?? 0);
    const serviceValue = Number(summary?.service_value ?? order.service_value ?? 0);
    const totalOrder = Number(summary?.total_order ?? order.service_cost ?? serviceValue + partsValue);
    const hasRegisteredFiscal = Boolean(order?.fiscal_document_number || order?.fiscal_document_url);
    const { data, setData, post, processing, errors } = useForm({
        fiscal_document_number: '',
        fiscal_document_url: '',
        fiscal_issued_at: '',
        fiscal_notes: '',
    });

    useEffect(() => {
        if (!open) return;

        setData({
            fiscal_document_number: order?.fiscal_document_number ?? '',
            fiscal_document_url: order?.fiscal_document_url ?? '',
            fiscal_issued_at: order?.fiscal_issued_at ? String(order.fiscal_issued_at).slice(0, 16) : '',
            fiscal_notes: order?.fiscal_notes ?? '',
        });
    }, [open, order?.id, order?.fiscal_document_number, order?.fiscal_document_url, order?.fiscal_issued_at, order?.fiscal_notes, setData]);

    const handleRegisterFiscal = () => {
        if (!orderId) return;

        post(route('app.orders.fiscal.register', orderId), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    const handleIssueFocus = () => {
        if (!orderId) return;

        router.post(route('app.fiscal-documents.orders.issue', orderId), {}, { preserveScroll: true, onSuccess: () => onClose() });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Emitir Nota de Serviço</DialogTitle>

                    <DialogDescription>
                        {focusEnabled
                            ? 'A integração Focus NFe está configurada para NFS-e. A emissão automática será feita por este módulo.'
                            : 'Utilize os dados abaixo para emitir a nota no portal da prefeitura.'}
                    </DialogDescription>
                </DialogHeader>

                <Card>
                    <CardContent className="space-y-2 pt-4 text-sm">
                        <div>
                            <span className="font-medium">Cliente:</span> {order.customer?.name}
                        </div>

                        <div>
                            <span className="font-medium">CPF/CNPJ:</span> {maskCpfCnpj(order.customer?.cpfcnpj ?? '')}
                        </div>

                        <Separator />

                        <div>
                            <span className="font-medium">Serviço:</span> {order.services_performed}
                        </div>

                        <div className="font-medium">Resumo para emissão da NFS-e</div>

                        <div className="flex justify-between text-sm">
                            <span>Peças</span>
                            <span>R$ {maskMoney(String(partsValue))}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span>Mão de obra</span>
                            <span>R$ {maskMoney(String(serviceValue))}</span>
                        </div>

                        <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span>R$ {maskMoney(String(totalOrder))}</span>
                        </div>

                        <div>
                            <span className="font-medium">Ordem de serviço:</span> #{order.order_number}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    {focusEnabled ? (
                        <Button type="button" onClick={handleIssueFocus} disabled={!orderId}>
                            Emitir via Focus NFe
                        </Button>
                    ) : (
                        <Button asChild>
                            <a href="https://www.nfse.gov.br/EmissorNacional" target="_blank" rel="noopener noreferrer">
                                Abrir emissor
                            </a>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardContent className="space-y-3 pt-4 text-sm">
                        {hasRegisteredFiscal ? (
                            <>
                                <div className="font-medium">Comprovante fiscal já registrado</div>
                                <div>
                                    <span className="font-medium">Número:</span> {order.fiscal_document_number || '-'}
                                </div>
                                <div>
                                    <span className="font-medium">Emitido em:</span> {order.fiscal_issued_at || '-'}
                                </div>
                                {order.fiscal_notes ? (
                                    <div>
                                        <span className="font-medium">Observações:</span> {order.fiscal_notes}
                                    </div>
                                ) : null}
                                {order.fiscal_document_url ? (
                                    <div className="flex justify-end">
                                        <Button asChild>
                                            <a href={order.fiscal_document_url} target="_blank" rel="noopener noreferrer">
                                                Abrir link da nota
                                            </a>
                                        </Button>
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <>
                                <div className="font-medium">Registrar comprovante fiscal no banco para consulta e auditoria</div>

                                <div className="space-y-1">
                                    <Label htmlFor="fiscal_document_number">Número do documento</Label>
                                    <Input
                                        id="fiscal_document_number"
                                        value={data.fiscal_document_number}
                                        onChange={(e) => setData('fiscal_document_number', e.target.value)}
                                        placeholder="Número da NFS-e"
                                    />
                                    <InputError message={errors.fiscal_document_number} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="fiscal_document_url">Link de consulta (opcional)</Label>
                                    <Input
                                        id="fiscal_document_url"
                                        value={data.fiscal_document_url}
                                        onChange={(e) => setData('fiscal_document_url', e.target.value)}
                                        placeholder="https://..."
                                    />
                                    <InputError message={errors.fiscal_document_url} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="fiscal_issued_at">Emitido em</Label>
                                    <Input
                                        id="fiscal_issued_at"
                                        type="datetime-local"
                                        value={data.fiscal_issued_at}
                                        onChange={(e) => setData('fiscal_issued_at', e.target.value)}
                                    />
                                    <InputError message={errors.fiscal_issued_at} />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <DialogFooter className="flex justify-between">
                    <Button variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>

                    {!hasRegisteredFiscal && (
                        <Button onClick={handleRegisterFiscal} disabled={!orderId || processing}>
                            Salvar comprovante
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
