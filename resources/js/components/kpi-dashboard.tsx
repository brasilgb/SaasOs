import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { LinkIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface KpiDashboardProps {
    title: string;
    value?: number | null;
    icon: ReactNode;
    description: ReactNode;
    link?: string;
}

export function KpiDashboard({ title, value, icon, description, link }: KpiDashboardProps) {
    return (
        <Card className="min-w-0">
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                <div className="min-w-0 space-y-1">
                    <CardDescription>{title}</CardDescription>

                    <CardTitle className="truncate text-3xl font-bold tabular-nums">{value}</CardTitle>
                </div>

                <CardAction className="text-muted-foreground shrink-0">{icon}</CardAction>
            </CardHeader>

            <CardFooter className="flex min-w-0 items-center justify-between gap-2 text-sm">
                <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs">{description}</div>

                {link && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href={link}
                                className="text-primary flex shrink-0 items-center gap-1 text-xs hover:underline"
                                aria-label={`Acessar ${title}`}
                            >
                                <LinkIcon className="h-4 w-4" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>Acessar {title}</TooltipContent>
                    </Tooltip>
                )}
            </CardFooter>
        </Card>
    );
}
