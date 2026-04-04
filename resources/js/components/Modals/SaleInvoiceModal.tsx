import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { maskCpfCnpj, maskMoney } from '@/Utils/mask';

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

                <DialogFooter className="flex justify-between">
                    <Button variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>

                    <Button asChild>
                        <a href="https://www.nfe.fazenda.gov.br" target="_blank" rel="noopener noreferrer">
                            Abrir emissor
                        </a>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
