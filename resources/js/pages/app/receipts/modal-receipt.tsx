import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Printer } from 'lucide-react';
import { useState } from 'react';

export default function ModalReceipt({ orderid }: { orderid: number }) {
    const [loadingType, setLoadingType] = useState<string | null>(null);

    const handlePrintReceipt = (e: any, type: string) => {
        e.preventDefault();
        setLoadingType(type);

        const url = route('app.receipts.printing', { or: orderid, tp: type, pdf: 1 });
        window.open(url, '_blank');

        setTimeout(() => setLoadingType(null), 400);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" size="icon" className="bg-sky-700 text-white hover:bg-sky-700">
                    <Printer className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Selecione o Recibo Desejado</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-3">
                        <Button variant="default" onClick={(e) => handlePrintReceipt(e, 'oraberta')} disabled={loadingType !== null}>
                            {loadingType === 'oraberta' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Entrada de equipamento
                        </Button>
                        <Button variant="default" onClick={(e) => handlePrintReceipt(e, 'orentrega')} disabled={loadingType !== null}>
                            {loadingType === 'orentrega' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Entrega de equipamento
                        </Button>
                        <Button variant="default" onClick={(e) => handlePrintReceipt(e, 'ororcamento')} disabled={loadingType !== null}>
                            {loadingType === 'ororcamento' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Orçamento de equipamento
                        </Button>
                        <Button variant="default" onClick={(e) => handlePrintReceipt(e, 'orchecklist')} disabled={loadingType !== null}>
                            {loadingType === 'orchecklist' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Checklist de equipamento
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
