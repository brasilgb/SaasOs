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
import { footerNavItems, mainConfItems, mainNavGroups, mainUserItems } from '@/Utils/navLinks';
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
                    {mainNavGroups.map((group) => (
                        <NavMain key={group.title} label={group.title} items={group.items} />
                    ))}
                    <div className="my-1">
                        <NavMainCollapsible label="Administração" items={mainConfItems} />
                    </div>
                    <NavMain items={mainUserItems} />
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
