import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarAdmin } from '@/components/app-sidebar-admin';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { useAppearance } from '@/hooks/use-appearance';
import { type BreadcrumbItem } from '@/types';
import { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

export default function AdminLayout({ breadcrumbs = [], children }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { appearance } = useAppearance();
    return (
        <AppShell variant="sidebar">
            <AppSidebarAdmin />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
                <Toaster theme={appearance} />
            </AppContent>
        </AppShell>
    );
}
