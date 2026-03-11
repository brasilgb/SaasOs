import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { useEffect, useState } from "react"
import { connectBackend } from "@/Utils/connectApi"

export function ChartAreaDashboard({ timerange }: any) {

  const isMobile = useIsMobile()
  const [chartData, setChartData] = useState<any>([])
  const [lines, setLines] = useState([])

  useEffect(() => {

    const getChartData = async () => {

      const response = await connectBackend.get(`chartEquipments/${timerange}`)

      setChartData(response.data.data)
      setLines(response.data.lines)

    }

    getChartData()

  }, [timerange])

  const chartConfig = React.useMemo(() => {

    const config: ChartConfig = {}

    lines.forEach((line: any, index: number) => {

      config[line.key] = {
        label: line.label,
        color: `var(--chart-${index + 1})`,
      }

    })

    return config

  }, [lines])

  return (
    <Card className="@container/card">

      <CardHeader>

        <CardTitle>Equipamentos recebidos • Últimos {timerange} dias</CardTitle>

        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total de equipamentos recebidos
          </span>
        </CardDescription>

      </CardHeader>


      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] w-full"
        >

          <LineChart data={chartData}>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
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
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  }
                  indicator="dot"
                />
              }
            />

            {lines.map((line: any, index: number) => (

              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={`var(--chart-${index + 1})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={500}
              />

            ))}

          </LineChart>

        </ChartContainer>

      </CardContent>

    </Card>
  )
}