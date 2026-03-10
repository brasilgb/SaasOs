import * as React from "react"
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts"

import moment from "moment"

import { useIsMobile } from "@/hooks/use-mobile"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardAction
} from "@/components/ui/card"

import {
    ToggleGroup,
    ToggleGroupItem
} from "@/components/ui/toggle-group"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

export default function ChartFluxoOrders({ orders }: any) {

    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState("7")

    const chartData = React.useMemo(() => {

        const chartMap: any = {}

        const filteredOrders = orders.filter((order: any) => {

            const days = moment().diff(moment(order.created_at), "days")

            return days <= Number(timeRange)

        })

        filteredOrders.forEach((order: any) => {

            let key
            let sortDate

            if (timeRange === "60") {

                key = `Sem ${moment(order.created_at).week()}`
                sortDate = moment(order.created_at).startOf("week")

            } else {

                key = moment(order.created_at).format("DD/MM")
                sortDate = moment(order.created_at)

            }

            if (!chartMap[key]) {
                chartMap[key] = {
                    period: key,
                    sortDate,
                    entradas: 0,
                    concluidos: 0,
                    entregues: 0
                }
            }

            chartMap[key].entradas += 1

            if (order.service_status === 6 || order.service_status === 7) {
                chartMap[key].concluidos += 1
            }

            if (order.service_status === 8) {
                chartMap[key].entregues += 1
            }

        })

        return Object.values(chartMap).sort(
            (a: any, b: any) => a.sortDate - b.sortDate
        )

    }, [orders, timeRange])

    return (

        <Card className="@container/card">

            <CardHeader>
                <CardTitle>Fluxo de Ordens</CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">
                        Entradas x Concluídos x Entregues
                    </span>

                    <span className="@[540px]/card:hidden">
                        Fluxo de OS
                    </span>

                </CardDescription>
                <CardAction>

                    {/* Desktop */}
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={(value) => value && setTimeRange(value)}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
                    >

                        <ToggleGroupItem value="7">
                            Últimos 07 dias
                        </ToggleGroupItem>

                        <ToggleGroupItem value="30">
                            Últimos 30 dias
                        </ToggleGroupItem>

                        <ToggleGroupItem value="60">
                            Últimos 60 dias
                        </ToggleGroupItem>

                    </ToggleGroup>

                    {/* Mobile */}
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="flex w-40 @[767px]/card:hidden"
                            size="sm"
                        >
                            <SelectValue placeholder="Últimos 60 dias" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="7" className="rounded-lg">
                                Últimos 07 dias
                            </SelectItem>

                            <SelectItem value="30" className="rounded-lg">
                                Últimos 30 dias
                            </SelectItem>

                            <SelectItem value="60" className="rounded-lg">
                                Últimos 60 dias
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <XAxis dataKey="period" />
                        <Tooltip />
                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="entradas"
                            stroke="#1a9cd9"
                            strokeWidth={2}
                            name="Entradas"
                            dot={false}
                        />

                        <Line
                            type="monotone"
                            dataKey="concluidos"
                            stroke="#16a34a"
                            strokeWidth={2}
                            name="Concluídos"
                            dot={false}
                        />

                        <Line
                            type="monotone"
                            dataKey="entregues"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            name="Entregues"
                            dot={false}
                        />

                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

    )
}