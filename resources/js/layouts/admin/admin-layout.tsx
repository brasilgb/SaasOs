import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarAdmin } from '@/components/app-sidebar-admin';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { useAppearance } from '@/hooks/use-appearance';
import { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

export default function AdminLayout({ children }: PropsWithChildren) {
    const { appearance } = useAppearance();
    return (
        <AppShell variant="sidebar">
            <AppSidebarAdmin />
            <AppContent variant="sidebar">
                <AppSidebarHeader />
                {children}
                <Toaster theme={appearance} />
            </AppContent>
        </AppShell>
    );
}
