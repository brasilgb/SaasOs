import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';


import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup>) {
    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {import.meta.env.VITE_APP_VERSION}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
