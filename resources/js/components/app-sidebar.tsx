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
    const collapsibleGroups = ['Relacionamento', 'Financeiro'];

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
                    {mainNavGroups.map((group, index) => (
                        <div key={group.title} className={index === 0 ? undefined : 'mt-1'}>
                            <NavMain
                                label={collapsibleGroups.includes(group.title) ? group.title : undefined}
                                groupIcon={group.icon}
                                items={group.items}
                                collapsible={collapsibleGroups.includes(group.title)}
                            />
                        </div>
                    ))}
                    <div className="mt-1">
                        <NavMainCollapsible items={mainConfItems} />
                    </div>
                    <div className="mt-1">
                        <NavMain items={mainUserItems} />
                    </div>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
