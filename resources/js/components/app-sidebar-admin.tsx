import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { mainAdminItems, mainPlansItems } from '@/Utils/navLinks';
import NavMainCollapsible from './nav-main-collapsible';
import AdminLogo from './admin-logo';

export function AppSidebarAdmin() {

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AdminLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Operações Administrativas</SidebarGroupLabel>

                    <NavMain items={mainAdminItems} /> 
                    <div className='my-1'>
                        <NavMainCollapsible items={mainPlansItems} />
                    </div>

                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}