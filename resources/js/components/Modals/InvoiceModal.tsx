import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { maskCpfCnpj, maskMoney } from "@/Utils/mask"

interface InvoiceModalProps {
  open: boolean
  onClose: () => void
  order: any
}

export default function InvoiceModal({ open, onClose, order }: InvoiceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">

        <DialogHeader>
          <DialogTitle>Emitir Nota de Serviço</DialogTitle>

          <DialogDescription>
            Utilize os dados abaixo para emitir a nota no portal da prefeitura.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="pt-4 space-y-2 text-sm">

            <div>
              <span className="font-medium">Cliente:</span>{" "}
              {order.customer?.name}
            </div>

            <div>
              <span className="font-medium">CPF/CNPJ:</span>{" "}
              {maskCpfCnpj(order.customer?.cpfcnpj)}
            </div>

            <Separator />

            <div>
              <span className="font-medium">Serviço:</span>{" "}
              {order.services_performed}
            </div>

            <div>
              <span className="font-medium">Valor:</span>{" "}
              R$ {maskMoney(order.service_cost)}
            </div>

            <div>
              <span className="font-medium">Ordem de serviço:</span>{" "}
              #{order.order_number}
            </div>

          </CardContent>
        </Card>

        <DialogFooter className="flex justify-between">

          <Button
            variant="ghost"
            onClick={onClose}
          >
            Fechar
          </Button>

          <Button
            asChild
          >
            <a
              href="https://www.nfse.gov.br/EmissorNacional"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir emissor
            </a>
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}