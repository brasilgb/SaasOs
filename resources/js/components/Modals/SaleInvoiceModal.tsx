import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { maskCpfCnpj, maskMoney } from '@/Utils/mask';
import { useForm } from '@inertiajs/react';

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
        numberSale: {
            id?: string | number;
        };
    };
}

export default function SaleInvoiceModal({ open, onClose, sale }: SaleInvoiceModalProps) {
    const saleId = sale?.numberSale?.id;
    const { data, setData, post, processing, errors } = useForm({
        fiscal_document_number: '',
        fiscal_document_key: '',
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

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Emitir Nota de Venda</DialogTitle>

                    <DialogDescription>Utilize os dados abaixo para emitir a nota fiscal de produto.</DialogDescription>
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
                            <span className="font-medium">Venda N°:</span> {sale.numberSale.id}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-3 pt-4 text-sm">
                        <div className="font-medium">Registrar comprovante fiscal</div>
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
                            <Label htmlFor="fiscal_document_key">Chave</Label>
                            <Input id="fiscal_document_key" value={data.fiscal_document_key} onChange={(e) => setData('fiscal_document_key', e.target.value)} />
                            <InputError message={errors.fiscal_document_key} />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="fiscal_document_url">URL</Label>
                            <Input id="fiscal_document_url" value={data.fiscal_document_url} onChange={(e) => setData('fiscal_document_url', e.target.value)} />
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
                    </CardContent>
                </Card>

                <DialogFooter className="flex justify-between">
                    <Button variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>

                    <Button asChild>
                        <a href="https://www.nfe.fazenda.gov.br" target="_blank" rel="noopener noreferrer">
                            Abrir emissor
                        </a>
                    </Button>
                    <Button onClick={handleRegisterFiscal} disabled={!saleId || processing}>
                        Salvar comprovante
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
