import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useEffect } from "react"
import { connectBackend } from "@/Utils/connectApi"

export const description = "Gráfico de área interativo"

export function ChartAreaDashboard() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("7")
  const [chartData, setChartData] = React.useState([])
  const [lines, setLines] = React.useState([])

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30")
    }
  }, [isMobile])

  useEffect(() => {
    const chartForDays = async () => {
      const response = await connectBackend.get(`chartEquipments/${timeRange}`);
      setChartData(response.data.data);
      setLines(response.data.lines)
    }
    chartForDays();
  }, [timeRange]);

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
        <CardTitle>Equipamentos recebidos</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total de equipamentos recebidos
          </span>
          <span className="@[540px]/card:hidden">Últimos 3 meses</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="7">Últimos 7 dias</ToggleGroupItem>
            <ToggleGroupItem value="30">Últimos 07 dias</ToggleGroupItem>
            <ToggleGroupItem value="60">Últimos 60 dias</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Últimos 60 dias" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7" className="rounded-lg">
                Últimos 7 dias
              </SelectItem>
              <SelectItem value="30" className="rounded-lg">
                Últimos 07 dias
              </SelectItem>
              <SelectItem value="60" className="rounded-lg">
                Últimos 60 dias
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              {lines.map((line: any, index: number) => (
                <linearGradient
                  key={line.key}
                  id={`fill-${line.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--chart-${index + 1})`}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--chart-${index + 1})`}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("pt-BR", {
                  month: "short",
                  day: "numeric",
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
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            {lines.map((line: any, index: number) => (
              <Area
                key={line.key}
                dataKey={line.key}
                type="natural"
                fill={`url(#fill-${line.key})`}
                stroke={`var(--chart-${index + 1})`}
                stackId="a"
                dot
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}