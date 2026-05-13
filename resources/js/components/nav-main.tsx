import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

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

export function NavMain({ items = [], label, collapsible = false }: { items: NavItem[]; label?: string; collapsible?: boolean }) {
    const { othersetting, auth, performanceAlert, customerFeedbackAlert, taskIndicator, fiscalSetting } = usePage<NavMainPageProps>().props;
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
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

    const renderItemBadge = (item: NavItem) => (
        <>
            {item.active === 'app.follow-ups.performance' && performanceAlert?.hasAlert && (
                <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px]">
                    Alerta
                </Badge>
            )}
            {item.active === 'app.quality.*' && customerFeedbackAlert?.hasAlert && (
                <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px]">
                    Alerta
                </Badge>
            )}
            {item.active === 'app.follow-ups.tasks' && taskIndicator?.hasTasks && Number(taskIndicator?.total ?? 0) > 0 && (
                <Badge variant="secondary" className="ml-auto h-5 min-w-5 px-1.5 text-[10px]">
                    {taskIndicator.total}
                </Badge>
            )}
        </>
    );

    if (collapsible && label) {
        const ParentIcon = visibleItems[0]?.icon;
        const isActive = visibleItems.some((item) => route().current(item.active ?? ''));

        if (isCollapsed) {
            return (
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton tooltip={label} isActive={isActive}>
                                    {ParentIcon && <ParentIcon />}
                                    <span>{label}</span>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start" className="w-56">
                                {visibleItems.map((item) => (
                                    <DropdownMenuItem key={item.title} asChild>
                                        <Link href={item.href} className={route().current(item.active ?? '') ? 'bg-accent text-accent-foreground' : ''}>
                                            {item.title}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            );
        }

        return (
            <SidebarMenu>
                <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={label} isActive={isActive}>
                                {ParentIcon && <ParentIcon />}
                                <span>{label}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {visibleItems.map((item) => (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton asChild isActive={route().current(item.active ?? '')}>
                                            <Link href={item.href}>
                                                <span>{item.title}</span>
                                                {renderItemBadge(item)}
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarMenu>
        );
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
                                {renderItemBadge(item)}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </>
    );
}
