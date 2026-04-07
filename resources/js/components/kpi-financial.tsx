import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface KpiFinancialProps {
    title: string;
    total?: number;
    services?: number;
    parts?: number;
    orders?: number;
    icon?: ReactNode;
}

export function KpiFinancial({ title, total = 0, services = 0, parts = 0, orders = 0, icon }: KpiFinancialProps) {
    const format = (v: number) =>
        v.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

    const percentServices = total > 0 ? Math.round((services / total) * 100) : 0;

    const percentParts = total > 0 ? Math.round((parts / total) * 100) : 0;

    return (
        <Card className="h-full min-w-0">
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                <CardDescription>{title}</CardDescription>

                <div className="text-muted-foreground shrink-0">{icon}</div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* VALOR PRINCIPAL */}
                <CardTitle className="truncate text-2xl font-bold tabular-nums 2xl:text-3xl">{format(total)}</CardTitle>

                {/* ORIGEM DO FATURAMENTO */}
                <div className="bg-muted flex h-2 w-full overflow-hidden rounded-full">
                    <div className="bg-primary" style={{ width: `${percentServices}%` }} />
                    <div className="bg-emerald-500" style={{ width: `${percentParts}%` }} />
                </div>

                {/* BREAKDOWN */}
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="flex flex-col rounded-lg border p-3">
                        <span className="text-muted-foreground flex justify-between text-xs">
                            Serviços
                            <span>{percentServices}%</span>
                        </span>

                        <span className="font-medium tabular-nums">{format(services)}</span>
                    </div>

                    <div className="flex flex-col rounded-lg border p-3">
                        <span className="text-muted-foreground flex justify-between text-xs">
                            Peças
                            <span>{percentParts}%</span>
                        </span>

                        <span className="font-medium tabular-nums">{format(parts)}</span>
                    </div>
                </div>

                {/* ORDENS ANALISADAS */}
                <div className="text-muted-foreground border-t pt-2 text-xs">
                    {orders} {orders > 1 ? 'ordens' : 'ordem'} {orders > 1 ? 'analisadas' : 'analisada'}
                </div>
            </CardContent>
        </Card>
    );
}
