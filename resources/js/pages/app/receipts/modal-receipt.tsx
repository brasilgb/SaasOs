import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Printer } from "lucide-react"
import { useForm } from "@inertiajs/react"

export default function ModalReceipt({ orderid }: { orderid: number }) {

    const { get } = useForm();
    const handlePrintReceipt = (e: any, type: string) => {
        e.preventDefault();
        get(route('receipts.printing', { or: orderid, tp: type }));
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" size="icon" className="bg-sky-700 hover:bg-sky-700 text-white">
                    <Printer className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Selecione o Recibo Desejado</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-3">
                        <Button variant="secondary"
                            onClick={(e) => handlePrintReceipt(e, 'oraberta')}
                        >
                            Entrada de equipamento
                        </Button>
                        <Button variant="secondary"
                            onClick={(e) => handlePrintReceipt(e, 'orentrega')}
                        >
                            Entrega de equipamento
                        </Button>
                        <Button variant="secondary"
                            onClick={(e) => handlePrintReceipt(e, 'ororcamento')}
                        >
                            Orçamento de equipamento
                        </Button>
                        <Button variant="secondary"
                            onClick={(e) => handlePrintReceipt(e, 'orchecklist')}
                        >
                            Checklist de equipamento
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
