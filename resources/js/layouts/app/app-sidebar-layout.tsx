import { AppContent } from '@/components/app-content';
import AppFooter from '@/components/app-footer';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children }: PropsWithChildren) {
    const { othersetting } = usePage().props as any;

    return (
        <AppShell variant={`${othersetting?.navigation ? "sidebar" : "header"}`}>
            {othersetting?.navigation ? <AppSidebar /> : <AppHeader /> }

            <AppContent variant={`${othersetting?.navigation ? "sidebar" : "header"}`}>
                {othersetting?.navigation ? <AppSidebarHeader /> : ''}
                {children}
            </AppContent>
               {othersetting?.navigation ? '' : <AppFooter />}
        </AppShell>
    );
}
