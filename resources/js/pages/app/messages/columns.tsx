import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, Pencil } from "lucide-react"
import moment from "moment"
import { Badge } from "@/components/ui/badge"
import { Link, usePage } from "@inertiajs/react"
import { Message } from "@/types"
import { statusAgendaByValue, statusMessageByValue } from "@/Utils/functions"
import ActionDelete from "@/components/action-delete"
import { AppLoadMessage } from "@/components/app-load-message"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Message>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-left pl-3">#</div>,
  },
  {
    accessorKey: "sender_id",
    accessorFn: row => `${row.sender.name}`,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Operador
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "recipient_id",
    accessorFn: row => `${row.recipient.name}`,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Usuário
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "schedules",
    header: () => <div className="text-left pl-3">Operação</div>,
    cell: ({ row }) => {
      const message = row.original;
      const { auth } = usePage().props as any;
      
      return <div className="text-left font-medium">
        {auth.user.id === message.sender_id ? <Badge variant={'secondary'} className='bg-green-500 text-white'>Enviada</Badge> : <Badge variant={'destructive'}>Recebida</Badge>}
      </div>
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const orgs = row.original.status;
      return (
        <div className="">
          <Badge variant={'default'}>{statusMessageByValue(orgs)}</Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div className="text-left pl-3">Data operação</div>,
    cell: ({ row }) => {
      const dataa = new Date(row.getValue("created_at"))
      const formatted = moment(dataa).format("DD/MM/YYYY HH:mm")

      return <div className="text-left font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: " ",
    cell: ({ row }) => {
      const message = row.original;
      const { auth } = usePage().props as any;

      return (
        <div className="flex items-center justify-end gap-2">

          {message.sender_id !== auth.user.id
            ? <AppLoadMessage message={message} />
            : <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Link href={route("messages.edit", message.id)}>
                {message.sender_id === auth.user.id ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Link>
            </Button>}

          <ActionDelete title={'esta mensagem'} url={'schedules.destroy'} param={message.id} />

        </div>
      )
    }
  }
]