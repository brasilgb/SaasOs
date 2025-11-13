import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { ptBR } from "react-day-picker/locale"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DateRange } from "react-day-picker"
import moment from "moment"
import "moment/dist/locale/pt-br"

moment.locale("pt-br")

interface DatePickerProps {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
}

// Arrays fixos para evitar recriação a cada render
const MONTHS = moment.months()
const YEARS = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i)

export function DatePicker({ dateRange, setDateRange }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date>(dateRange?.from ?? new Date())
  const hasSelectedFirst = React.useRef(false)

  const displayValue = dateRange?.from
    ? dateRange.to
      ? `${moment(dateRange.from).format("DD/MM/YYYY")} - ${moment(dateRange.to).format("DD/MM/YYYY")}`
      : moment(dateRange.from).format("DD/MM/YYYY")
    : "Selecione o intervalo"

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) {
      setDateRange(undefined)
      hasSelectedFirst.current = false
      return
    }

    if (dateRange?.from && dateRange?.to) {
      // Reinicia nova seleção
      setDateRange({ from: range.from, to: undefined })
      hasSelectedFirst.current = true
      return
    }

    // Caso o usuário clique duas vezes no mesmo dia
    if (range.from && range.to && range.from.getTime() === range.to.getTime()) {
      setDateRange({ from: range.from, to: undefined })
      hasSelectedFirst.current = true
      return
    }

    setDateRange(range)

    if (!hasSelectedFirst.current) {
      hasSelectedFirst.current = true
    } else if (range.from && range.to) {
      hasSelectedFirst.current = false
      setOpen(false)
    }
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value)
    const newDate = new Date(month)
    newDate.setMonth(newMonth)
    setMonth(newDate)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value)
    const newDate = new Date(month)
    newDate.setFullYear(newYear)
    setMonth(newDate)
  }

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
              onClick={() => setOpen(true)}
              aria-label="Selecionar intervalo de datas"
            />
            <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
              <CalendarIcon className="size-3.5" />
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto overflow-hidden p-3"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          {/* Cabeçalho de seleção de mês e ano */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <select
              className="border rounded-md px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={month.getMonth()}
              onChange={handleMonthChange}
            >
              {MONTHS.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>

            <select
              className="border rounded-md px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={month.getFullYear()}
              onChange={handleYearChange}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Calendário principal */}
          <Calendar
            locale={ptBR}
            mode="range"
            selected={dateRange}
            month={month}
            onMonthChange={setMonth}
            onSelect={handleSelect}
            className="rounded-lg border shadow-sm"
          />

          {/* Botão para limpar seleção */}
          {dateRange?.from && (
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  setDateRange(undefined)
                  hasSelectedFirst.current = false
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
