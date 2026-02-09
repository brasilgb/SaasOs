import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useForm } from "@inertiajs/react"
import { Ban } from "lucide-react"

export default function ActionCancelSale({ saleId, disabled }: { saleId: number, disabled: boolean }) {
  const { post, processing } = useForm()

  const handleCancel = () => {
    post(route('app.sales.cancel', saleId), {
      preserveScroll: true,
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon" title="Cancelar Venda" disabled={!disabled}>
          <Ban className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar venda?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação irá cancelar a venda e devolver os itens ao estoque.
            Essa operação não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={processing}
            className="bg-red-600 hover:bg-red-700"
          >
            Confirmar Cancelamento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
