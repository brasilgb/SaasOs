import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { maskCpfCnpj, maskMoney } from '@/Utils/mask';
import { router, useForm, usePage } from '@inertiajs/react';

interface SaleInvoiceModalProps {
    open: boolean;
    onClose: () => void;
    sale: {
        customer?: Array<{
            name?: string;
            cpfcnpj?: string;
        }>;
        items?: Array<{
            name?: string;
            selected_quantity?: number;
            sale_price?: string | number;
        }>;
        total?: string | number;
        fiscal_document_number?: string;
        fiscal_document_url?: string;
        fiscal_issued_at?: string;
        fiscal_notes?: string;
        numberSale: {
            id?: string | number;
        };
    };
}

export default function SaleInvoiceModal({ open, onClose, sale }: SaleInvoiceModalProps) {
    const { fiscalSetting } = usePage<{ fiscalSetting?: { enabled?: boolean; nfe_enabled?: boolean; has_api_token?: boolean } | null }>().props;
    const focusEnabled = Boolean(fiscalSetting?.enabled && fiscalSetting?.nfe_enabled && fiscalSetting?.has_api_token);
    const saleId = sale?.numberSale?.id;
    const hasRegisteredFiscal = Boolean(sale?.fiscal_document_number || sale?.fiscal_document_url);
    const { data, setData, post, processing, errors } = useForm({
        fiscal_document_number: '',
        fiscal_document_url: '',
        fiscal_issued_at: '',
        fiscal_notes: '',
    });

    const handleRegisterFiscal = () => {
        if (!saleId) return;

        post(route('app.sales.fiscal.register', saleId), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    const handleIssueFocus = () => {
        if (!saleId) return;

        router.post(route('app.fiscal-documents.sales.issue', saleId), {}, { preserveScroll: true, onSuccess: () => onClose() });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Emitir Nota de Venda</DialogTitle>

                    <DialogDescription>
                        {focusEnabled
                            ? 'A integração Focus NFe está configurada para NF-e. A emissão automática será feita por este módulo.'
                            : 'Utilize os dados abaixo para emitir a nota fiscal de produto.'}
                    </DialogDescription>
                </DialogHeader>

                <Card>
                    <CardContent className="space-y-2 pt-4 text-sm">
                        <div>
                            <span className="font-medium">Cliente:</span> {sale.customer?.[0]?.name ?? 'Venda avulsa'}
                        </div>

                        <div>
                            <span className="font-medium">CPF/CNPJ:</span> {maskCpfCnpj(sale.customer?.[0]?.cpfcnpj ?? '')}
                        </div>

                        <Separator />

                        <div className="font-medium">Produtos</div>

                        {sale.items?.map((item, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                                <span>
                                    {item?.name} x {item.selected_quantity}
                                </span>

                                <span>R$ {maskMoney(String(item.sale_price ?? ''))}</span>
                            </div>
                        ))}

                        <Separator />

                        <div className="flex justify-between font-medium">
                            <span>Total</span>

                            <span>R$ {maskMoney(String(sale.total ?? ''))}</span>
                        </div>

                        <div>
                            <span className="font-medium">Venda N°:</span> {sale?.numberSale?.id ?? '-'}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    {focusEnabled ? (
                        <Button type="button" onClick={handleIssueFocus} disabled={!saleId}>
                            Emitir via Focus NFe
                        </Button>
                    ) : (
                        <Button asChild>
                            <a href="https://www.nfe.fazenda.gov.br" target="_blank" rel="noopener noreferrer">
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
                                    <span className="font-medium">Número:</span> {sale.fiscal_document_number || '-'}
                                </div>
                                <div>
                                    <span className="font-medium">Emitido em:</span> {sale.fiscal_issued_at || '-'}
                                </div>
                                {sale.fiscal_notes ? (
                                    <div>
                                        <span className="font-medium">Observações:</span> {sale.fiscal_notes}
                                    </div>
                                ) : null}
                                {sale.fiscal_document_url ? (
                                    <div className="flex justify-end">
                                        <Button asChild>
                                            <a href={sale.fiscal_document_url} target="_blank" rel="noopener noreferrer">
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
                                    />
                                    <InputError message={errors.fiscal_document_number} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="fiscal_document_url">URL</Label>
                                    <Input
                                        id="fiscal_document_url"
                                        value={data.fiscal_document_url}
                                        onChange={(e) => setData('fiscal_document_url', e.target.value)}
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
                        <Button onClick={handleRegisterFiscal} disabled={!saleId || processing}>
                            Salvar comprovante
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
