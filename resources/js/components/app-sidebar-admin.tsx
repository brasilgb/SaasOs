import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { mainAdminAdjustmentItems, mainAdminItems, mainPlansItems } from '@/Utils/navLinks';
import { Link } from '@inertiajs/react';
import { MessageSquareMore } from 'lucide-react';
import { SigmaOSPanelLogo } from './sigma-os-logo';

export function AppSidebarAdmin() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <SigmaOSPanelLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Operações Administrativas</SidebarGroupLabel>

                    <NavMain items={mainAdminItems} />
                    <div className="mt-1">
                        <NavMain items={mainAdminAdjustmentItems} label="Ajustes/Avaliações" groupIcon={MessageSquareMore} collapsible />
                    </div>
                    <div className="mt-1">
                        <NavMain items={mainPlansItems} />
                    </div>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
