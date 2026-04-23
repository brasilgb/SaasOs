import { Badge } from '@/components/ui/badge';
import { SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

type NavMainPageProps = {
    othersetting?: {
        enablesales?: boolean;
        show_follow_ups_menu?: boolean;
        show_tasks_menu?: boolean;
        show_commercial_performance_menu?: boolean;
        show_quality_menu?: boolean;
    };
    auth: {
        role?: string;
        permissions?: string[];
    };
    performanceAlert?: {
        hasAlert?: boolean;
    } | null;
    customerFeedbackAlert?: {
        hasAlert?: boolean;
    } | null;
    taskIndicator?: {
        total?: number;
        hasTasks?: boolean;
    } | null;
    fiscalSetting?: {
        enabled?: boolean;
        nfe_enabled?: boolean;
        nfse_enabled?: boolean;
    } | null;
};

export function NavMain({ items = [], label }: { items: NavItem[]; label?: string }) {
    const { othersetting, auth, performanceAlert, customerFeedbackAlert, taskIndicator, fiscalSetting } = usePage<NavMainPageProps>().props;
    const disableSales = !othersetting?.enablesales ? 'sales' : '';
    const permissions = auth?.permissions ?? [];
    const canAccessSalesModules =
        auth?.role === 'administrator' || auth?.role === 'operator' || auth?.role === 'root_app' || auth?.role === 'root_system';
    const visibleItems = items.filter(
        (item) =>
            (item.visibilitySetting ? (othersetting?.[item.visibilitySetting as keyof typeof othersetting] ?? false) : true) &&
            (item.title !== 'Vendas' && item.title !== 'Despesas' && item.title !== 'Caixa diário'
                ? true
                : canAccessSalesModules && !!othersetting?.enablesales) &&
            (!item.fiscalSetting || Boolean(fiscalSetting?.[item.fiscalSetting])) &&
            item.enabled !== disableSales &&
            (!item.permission || permissions.includes(item.permission)),
    );

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <>
            {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarMenu>
                {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={route().current(item.active ?? '')} tooltip={{ children: item.title }}>
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                {item.title === 'Performance' && performanceAlert?.hasAlert && (
                                    <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px]">
                                        Alerta
                                    </Badge>
                                )}
                                {item.title === 'Garantia e avaliações' && customerFeedbackAlert?.hasAlert && (
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
                ))}
            </SidebarMenu>
        </>
    );
}
