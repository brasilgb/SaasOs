import { Button, buttonVariants } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Calendar, Edit, Wrench } from "lucide-react"
import moment from "moment"
import { Badge } from "@/components/ui/badge"
import { maskCnpj, maskCpfCnpj, maskPhone } from "@/Utils/mask"
import { Link } from "@inertiajs/react"
import ActionDelete from "@/components/action-delete"
import { Customer } from "@/types"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-left pl-3">#</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          E-mail
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "cpf",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          CPF
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const cpf = row.original.cpf
      return (
        <span>{maskCpfCnpj(cpf)}</span>
      )
    }
  },
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Telefone
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const phone = row.original.phone
      return (
        <span>{maskPhone(phone)}</span>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div className="text-left pl-3">Cadastro</div>,
    cell: ({ row }) => {
      const dataa = new Date(row.getValue("created_at"))
      const formatted = moment(dataa).format("DD/MM/YYYY")

      return <div className="text-left font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: " ",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          <Button asChild size="icon" className="bg-green-500 hover:bg-green-500 text-white">
            <a target='_blank' href={`https://wa.me/${customer.whatsapp}?text=Olá, ${customer.name}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
              </svg>
            </a>
          </Button>

          <Button asChild size="icon" className="bg-sky-500 hover:bg-sky-600 text-white">
            <Link href={`/schedules?cl=${customer.id}`}>
              <Calendar className="h-4 w-4" />
            </Link>
          </Button>

          <Button asChild size="icon" className="bg-sky-500 hover:bg-sky-600 text-white">
            <Link href={`/orders?cl=${customer.id}`}>
              <Wrench className="h-4 w-4" />
            </Link>
          </Button>

          <Button className={`${buttonVariants({ variant: "destructive" })} bg-orange-500 hover:bg-orange-500/90 dark:bg-orange-500 dark:hover:bg-orange-500/90`} size="icon" asChild title="Editar organização">
            <Link href={route('customers.edit', customer.id)}>
              <Edit />
            </Link>
          </Button>

          <ActionDelete title={'este cliente'} url={'customers.destroy'} param={customer.id} />
        </div>
      )
    }
  }
]