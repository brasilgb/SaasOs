import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { router } from "@inertiajs/react"
import { Eye, MessageCircleMore } from "lucide-react"
import { useState } from "react"

export function AppLoadMessage({ message }: { message: any }) {
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: any) => {
    e.preventDefault();
    router.patch(route('app.messages.read', message.id), {
      status: message.status ? false : true,
      title: message.title,
      message: message.message,
      sender_id: message.sender.id,
      recipient_id: message.recipient.id,
    });
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="icon">
          <Eye />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader >
          <DialogTitle className="flex items-center gap-2"><MessageCircleMore /> Ler mensagem</DialogTitle>
          <DialogDescription>
            Para marcar a mensage como lida clique em marcar como lida, ou para sair sem ler clique em sair.
          </DialogDescription>
        </DialogHeader>
        <div className="grid border-t bg-gray-50 rounded-md">
          <h1 className="text-lg font-bold text-gray-600 border-b border-gray-200 px-2 py-1">Mensagem</h1>
          <p className="text-sm text-gray-500 p-2">{message.message}</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Sair</Button>
          </DialogClose>
          <Button onClick={handleSubmit} type="submit">
            {message.status ? 'Marcar como não lida' : 'Marcar como lida' }
            
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
