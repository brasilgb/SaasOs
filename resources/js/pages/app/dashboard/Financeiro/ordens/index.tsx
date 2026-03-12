import { FinancialRevenueChart } from '@/components/Charts/chart-financial-revenue';
import { KpiFinancial } from '@/components/kpi-financial';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { connectBackend } from '@/Utils/connectApi';
import { DollarSign, Receipt, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react'

export default function FinanceiroOrders({ timerange }: any) {
    const [kpiOrders, setKpisOrders] = useState<any>([])
    const [chartFinancial, setChartFinancial] = useState<any>([])

    useEffect(() => {
        const getOrders = async () => {
            try {
                const response = await connectBackend.get(`kpisFinancialOrder/${timerange}`);
                setKpisOrders(response.data.kpis);
            } catch (error) {
                console.error("Erro ao carregar dados dos kpis financeiro", error);
            }
        }
        getOrders();
    }, [timerange]);

    useEffect(() => {
        const getChartFinancial = async () => {
            try {
                const response = await connectBackend.get(`financialRevenueChart/${timerange}`);
                setChartFinancial(response.data);
            } catch (error) {
                console.error("Erro ao carregar dados dos kpis financeiro", error);
            }
        }
        getChartFinancial();
    }, [timerange]);

    return (
        <div>
            <div className='grid md:grid-cols-4 gap-4'>

                <KpiFinancial
                    title="Faturamento - Diário"
                    total={kpiOrders?.today_revenue?.total}
                    services={kpiOrders?.today_revenue?.services}
                    parts={kpiOrders?.today_revenue?.parts}
                    icon={<DollarSign size={18} />}
                    orders={kpiOrders?.orders_count}
                />

                <KpiFinancial
                    title={`Faturamento - Período ${timerange} dias`}
                    total={kpiOrders?.range_revenue?.total}
                    services={kpiOrders?.range_revenue?.services}
                    parts={kpiOrders?.range_revenue?.parts}
                    icon={<DollarSign size={18} />}
                    orders={kpiOrders?.orders_count}
                />

                <KpiFinancial
                    title={`Média - Período ${timerange} dias`}
                    total={kpiOrders?.daily_average?.total}
                    services={kpiOrders?.daily_average?.services}
                    parts={kpiOrders?.daily_average?.parts}
                    icon={<TrendingUp size={18} />}
                    orders={kpiOrders?.orders_count}
                />

                <KpiFinancial
                    title={`Ticket Médio - Período ${timerange} dias`}
                    total={kpiOrders?.average_ticket?.total}
                    services={kpiOrders?.average_ticket?.services}
                    parts={kpiOrders?.average_ticket?.parts}
                    icon={<Receipt size={18} />}
                    orders={kpiOrders?.orders_count}
                />
            </div>

            <div className='mt-4'>
                <Card>
                <CardHeader>
                    <CardTitle>Faturamento</CardTitle>
                    <CardDescription>Serviços, peças e total do período de {timerange} dias</CardDescription>
                </CardHeader>

                <CardContent>
                    <FinancialRevenueChart data={chartFinancial} />
                </CardContent>
            </Card>
            </div>

        </div>
    )
}
