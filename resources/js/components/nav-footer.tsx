import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

import { type ComponentPropsWithoutRef } from 'react';

type NavFooterPageProps = {
    auth: {
        permissions?: string[];
    };
};

export function NavFooter({ items = [], className, ...props }: ComponentPropsWithoutRef<typeof SidebarGroup> & { items?: NavItem[] }) {
    const { auth } = usePage<NavFooterPageProps>().props;
    const permissions = auth?.permissions ?? [];

    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map(
                        (item) =>
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
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
