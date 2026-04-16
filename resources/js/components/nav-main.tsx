import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

type NavMainPageProps = {
    othersetting?: {
        enablesales?: boolean;
    };
    auth: {
        role?: string;
        permissions?: string[];
    };
    performanceAlert?: {
        hasAlert?: boolean;
    } | null;
    taskIndicator?: {
        total?: number;
        hasTasks?: boolean;
    } | null;
};

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { othersetting, auth, performanceAlert, taskIndicator } = usePage<NavMainPageProps>().props;
    const disableSales = !othersetting?.enablesales ? 'sales' : '';
    const permissions = auth?.permissions ?? [];
    const canAccessSalesModules =
        auth?.role === 'administrator' || auth?.role === 'operator' || auth?.role === 'root_app' || auth?.role === 'root_system';

    return (
        <SidebarMenu>
            {items.map(
                (item) =>
                    (item.title !== 'Vendas' && item.title !== 'Despesas' && item.title !== 'Caixa diário'
                        ? true
                        : canAccessSalesModules && !!othersetting?.enablesales) &&
                    item.enabled !== disableSales &&
                    (!item.permission || permissions.includes(item.permission)) && (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={route().current(item.active ?? '')} tooltip={{ children: item.title }}>
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    {item.title === 'Perf. comercial' && performanceAlert?.hasAlert && (
                                        <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px]">
                                            Alerta
                                        </Badge>
                                    )}
                                    {item.title === 'Tarefas' && taskIndicator?.hasTasks && Number(taskIndicator?.total ?? 0) > 0 && (
                                        <Badge variant="secondary" className="ml-auto h-5 min-w-5 px-1.5 text-[10px]">
                                            {taskIndicator.total}
                                        </Badge>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ),
            )}
        </SidebarMenu>
    );
}
