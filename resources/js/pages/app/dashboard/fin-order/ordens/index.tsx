import { FinancialRevenueChart } from '@/components/Charts/chart-financial-revenue';
import { KpiFinancial } from '@/components/kpi-financial';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { connectBackend } from '@/Utils/connectApi';
import { DollarSign, Receipt, TrendingUp } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';

function formatIsoDate(date: Date | string) {
    const d = date instanceof Date ? date : new Date(date);
    return moment(d).format('YYYY-MM-DD');
}

function formatBrDate(date: Date | string) {
    const d = date instanceof Date ? date : new Date(date);
    return moment(d).format('DD/MM/YYYY');
}

export default function FinanceiroOrders({ timerange, dateRange, customRange }: any) {
    const [kpiOrders, setKpisOrders] = useState<any>([]);
    const [chartFinancial, setChartFinancial] = useState<any>([]);

    useEffect(() => {
        const getOrders = async () => {
            try {
                const query = new URLSearchParams();

                if (customRange && dateRange?.from && dateRange?.to) {
                    query.set('from', formatIsoDate(dateRange.from));
                    query.set('to', formatIsoDate(dateRange.to));
                }

                const response = await connectBackend.get(`kpisFinancialOrder/${timerange}${query.toString() ? `?${query.toString()}` : ''}`);
                setKpisOrders(response.data.kpis);
            } catch (error) {
                console.error('Erro ao carregar dados dos kpis financeiro', error);
            }
        };
        getOrders();
    }, [timerange, customRange, dateRange]);

    useEffect(() => {
        const getChartFinancial = async () => {
            try {
                const query = new URLSearchParams();

                if (customRange && dateRange?.from && dateRange?.to) {
                    query.set('from', formatIsoDate(dateRange.from));
                    query.set('to', formatIsoDate(dateRange.to));
                }

                const response = await connectBackend.get(`financialRevenueChart/${timerange}${query.toString() ? `?${query.toString()}` : ''}`);
                setChartFinancial(response.data);
            } catch (error) {
                console.error('Erro ao carregar dados dos kpis financeiro', error);
            }
        };
        getChartFinancial();
    }, [timerange, customRange, dateRange]);

    const rangeLabel =
        customRange && dateRange?.from && dateRange?.to ? `${formatBrDate(dateRange.from)} a ${formatBrDate(dateRange.to)}` : `${timerange} dias`;

    return (
        <div className="min-w-0">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <KpiFinancial
                    title="Faturamento - Diário"
                    total={kpiOrders?.today_revenue?.total}
                    services={kpiOrders?.today_revenue?.services}
                    parts={kpiOrders?.today_revenue?.parts}
                    icon={<DollarSign size={18} />}
                    orders={kpiOrders?.orders_today_count}
                />

                <KpiFinancial
                    title={`Faturamento - Período ${rangeLabel}`}
                    total={kpiOrders?.range_revenue?.total}
                    services={kpiOrders?.range_revenue?.services}
                    parts={kpiOrders?.range_revenue?.parts}
                    icon={<DollarSign size={18} />}
                    orders={kpiOrders?.orders_count}
                />

                <KpiFinancial
                    title={`Média - Período ${rangeLabel}`}
                    total={kpiOrders?.daily_average?.total}
                    services={kpiOrders?.daily_average?.services}
                    parts={kpiOrders?.daily_average?.parts}
                    icon={<TrendingUp size={18} />}
                    orders={kpiOrders?.orders_count}
                />

                <KpiFinancial
                    title={`Ticket Médio - Período ${rangeLabel}`}
                    total={kpiOrders?.average_ticket?.total}
                    services={kpiOrders?.average_ticket?.services}
                    parts={kpiOrders?.average_ticket?.parts}
                    icon={<Receipt size={18} />}
                    orders={kpiOrders?.orders_count}
                />
            </div>

            <div className="mt-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Faturamento</CardTitle>
                        <CardDescription>Serviços, peças e total do período de {rangeLabel}</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <FinancialRevenueChart data={chartFinancial} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
