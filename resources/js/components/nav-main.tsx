import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

type NavMainPageProps = {
    othersetting?: {
        enablesales?: boolean;
    };
    auth: {
        permissions?: string[];
    };
};

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { othersetting, auth } = usePage<NavMainPageProps>().props;
    const disableSales = !othersetting?.enablesales ? 'sales' : '';
    const permissions = auth?.permissions ?? [];

    return (
        <SidebarMenu>
            {items.map(
                (item) =>
                    item.enabled !== disableSales &&
                    (!item.permission || permissions.includes(item.permission)) && (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={route().current(item.active ?? '')} tooltip={{ children: item.title }}>
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ),
            )}
        </SidebarMenu>
    );
}
