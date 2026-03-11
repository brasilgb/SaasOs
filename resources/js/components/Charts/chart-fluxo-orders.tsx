import * as React from "react"
import { LineChart, Line, XAxis, CartesianGrid } from "recharts"
import { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { connectBackend } from "@/Utils/connectApi"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export default function ChartFluxoOrders({ timerange}: any) {

  const isMobile = useIsMobile()

  const [orders, setOrders] = useState([])

      useEffect(() => {
        const getOrders = async () => {
          try {
            const response = await connectBackend.get(`fluxsOrders/${timerange}`);
            setOrders(response.data);
          } catch (error) {
            console.error("Erro ao carregar dados do gráfico Fluxo de ordens", error);
          }
        }
        getOrders();
      }, [timerange]);


  const chartConfig = {
    entradas: {
      label: "Entradas",
      color: "var(--chart-1)",
    },
    concluidos: {
      label: "Concluídos",
      color: "var(--chart-2)",
    },
    entregues: {
      label: "Entregues",
      color: "var(--chart-3)",
    },
  }


  return (
    <Card className="@container/card">

      <CardHeader>

        <CardTitle>Fluxo de Ordens Últimos • {timerange} dias</CardTitle>

        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Entradas x Concluídos x Entregues
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <LineChart data={orders}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {

                  const date = new Date(value)
                  
                  return date.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                    
                }}
            />

            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  }}
                  indicator="dot"
                />
              }
            />

            <Line
              type="monotone"
              dataKey="entradas"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />

            <Line
              type="monotone"
              dataKey="concluidos"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />

            <Line
              type="monotone"
              dataKey="entregues"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />

          </LineChart>

        </ChartContainer>

      </CardContent>

    </Card>
  )
}