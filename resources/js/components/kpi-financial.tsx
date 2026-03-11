import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"

interface KpiFinancialProps {
  title: string
  total?: number
  services?: number
  parts?: number
  orders?: number
  icon?: ReactNode
}

export function KpiFinancial({
  title,
  total = 0,
  services = 0,
  parts = 0,
  orders = 0,
  icon,
}: KpiFinancialProps) {

  const format = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })

  const percentServices =
    total > 0 ? Math.round((services / total) * 100) : 0

  const percentParts =
    total > 0 ? Math.round((parts / total) * 100) : 0

  return (
    <Card className="h-full">

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription>{title}</CardDescription>

        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* VALOR PRINCIPAL */}
        <CardTitle className="text-3xl font-bold tabular-nums">
          {format(total)}
        </CardTitle>

        {/* ORIGEM DO FATURAMENTO */}
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden flex">
          <div
            className="bg-primary"
            style={{ width: `${percentServices}%` }}
          />
          <div
            className="bg-emerald-500"
            style={{ width: `${percentParts}%` }}
          />
        </div>

        {/* BREAKDOWN */}
        <div className="grid grid-cols-2 gap-3 text-sm">

          <div className="flex flex-col rounded-lg border p-3">
            <span className="text-muted-foreground text-xs flex justify-between">
              Serviços
              <span>{percentServices}%</span>
            </span>

            <span className="font-medium tabular-nums">
              {format(services)}
            </span>
          </div>

          <div className="flex flex-col rounded-lg border p-3">
            <span className="text-muted-foreground text-xs flex justify-between">
              Peças
              <span>{percentParts}%</span>
            </span>

            <span className="font-medium tabular-nums">
              {format(parts)}
            </span>
          </div>

        </div>

        {/* ORDENS ANALISADAS */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          {orders} ordens analisadas
        </div>

      </CardContent>

    </Card>
  )
}