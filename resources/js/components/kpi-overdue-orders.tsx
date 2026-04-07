import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { LinkIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface KpiOverdueOrdersProps {
    title: string;
    icon?: ReactNode;
    link?: string;
    ordersToday?: number | null;
    ordersTomorrow?: number | null;
    value?: number | null;
}

export function KpiOverdueOrders({ title, icon, link, ordersToday = 0, ordersTomorrow = 0, value }: KpiOverdueOrdersProps) {
    const totalOrders = value ?? Number(ordersToday || 0) + Number(ordersTomorrow || 0);
    const hasTodayOrders = Number(ordersToday || 0) > 0;
    const hasTomorrowOrders = Number(ordersTomorrow || 0) > 0;

    return (
        <Card className="h-full min-w-0">
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                <div className="min-w-0 space-y-1">
                    <CardDescription>{title}</CardDescription>
                    <CardTitle className="text-3xl font-bold tabular-nums">{totalOrders}</CardTitle>
                </div>

                <CardAction className="text-muted-foreground shrink-0">{icon}</CardAction>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                    <div
                        className={`rounded-lg border p-3 ${
                            hasTodayOrders ? 'border-red-200 bg-red-50 text-red-950' : 'border-border bg-background'
                        }`}
                    >
                        <div className={`text-xs ${hasTodayOrders ? 'text-red-700' : 'text-muted-foreground'}`}>Vencendo hoje</div>
                        <div className="mt-1 text-lg font-semibold tabular-nums">{ordersToday}</div>
                    </div>

                    <div
                        className={`rounded-lg border p-3 ${
                            hasTomorrowOrders ? 'border-amber-200 bg-amber-50 text-amber-950' : 'border-border bg-background'
                        }`}
                    >
                        <div className={`text-xs ${hasTomorrowOrders ? 'text-amber-700' : 'text-muted-foreground'}`}>Vencendo amanhã</div>
                        <div className="mt-1 text-lg font-semibold tabular-nums">{ordersTomorrow}</div>
                    </div>
                </div>

                <div className="flex min-w-0 items-center justify-between gap-2 pt-1">
                    <Badge variant={hasTodayOrders ? 'destructive' : 'secondary'} className="min-w-0">
                        <span className="truncate">Vencendo hoje e amanha</span>
                    </Badge>

                    {link && (
                        <Link href={link} className="text-primary flex shrink-0 items-center gap-1 text-xs hover:underline">
                            <LinkIcon className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
