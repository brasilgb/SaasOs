import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { footerNavItems, mainAdminItems, mainPlansItems } from '@/Utils/navLinks';
import NavMainCollapsible from './nav-main-collapsible';
import AdminLogo from './admin-logo';

export function AppSidebarAdmin() {
    const { othersetting } = usePage().props as any;

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

                    {/* {othersetting?.budget ?
                        <div className='my-1'>
                            <NavMainCollapsible items={mainRegisterItems} />
                        </div> : ''
                    }

                    <NavMain items={mainUserItems} /> */}

                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
