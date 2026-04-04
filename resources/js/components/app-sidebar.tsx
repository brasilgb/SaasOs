import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { mainConfItems, mainNavItems, mainUserItems } from '@/Utils/navLinks';
import { Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import NavMainCollapsible from './nav-main-collapsible';

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <NavMain items={mainNavItems} />
                    <div className="my-1">
                        <NavMainCollapsible items={mainConfItems} />
                    </div>
                    <NavMain items={mainUserItems} />
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
