import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import "react-day-picker/style.css"
import { ptBR } from "react-day-picker/locale"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import moment from "moment"
import { DateRange } from "react-day-picker"

interface DatePickerProps {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
}

export function DatePicker({ dateRange, setDateRange }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const hasSelectedFirst = React.useRef(false)

  const displayValue = dateRange?.from
    ? dateRange.to
      ? `${moment(dateRange.from).format("DD/MM/YYYY")} - ${moment(dateRange.to).format("DD/MM/YYYY")}`
      : moment(dateRange.from).format("DD/MM/YYYY")
    : "Selecione o intervalo"

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              id="date"
              value={displayValue}
              placeholder="Selecione o intervalo"
              className="bg-background pr-10 cursor-pointer"
              readOnly
            />
            <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
              <CalendarIcon className="size-3.5" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            locale={ptBR}
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(range) => {
              if (!range) {
                setDateRange(undefined)
                hasSelectedFirst.current = false
                return
              }

              setDateRange(range)

              if (!hasSelectedFirst.current) {
                hasSelectedFirst.current = true // primeiro clique
              } else if (range.from && range.to) {
                hasSelectedFirst.current = false
                setOpen(false) // fecha só no segundo
              }
            }}
            className="rounded-lg border shadow-sm"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
