import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { LinkIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface KpiDashboardProps {
    title: string;
    value?: number | null;
    icon: ReactNode;
    description: string;
    link?: string;
    valuedays?: number;
}

function formatNumberPtBr(value: number) {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);
}

export function KpiDashboard({ title, value, icon, description, link, valuedays }: KpiDashboardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                    <CardDescription>{title}</CardDescription>

                    <CardTitle className="text-3xl font-bold tabular-nums">{value}</CardTitle>
                </div>

                <CardAction className="text-muted-foreground">{icon}</CardAction>
            </CardHeader>

            <CardFooter className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    {description}

                    {valuedays !== undefined && valuedays !== null && (
                        <Badge variant="secondary">{formatNumberPtBr(valuedays)}</Badge>
                    )}
                </div>

                {link && (
                    <Link href={link} className="text-primary flex items-center gap-1 text-xs hover:underline">
                        <LinkIcon className="h-4 w-4" />
                    </Link>
                )}
            </CardFooter>
        </Card>
    );
}
