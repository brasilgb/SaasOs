import { AppContent } from '@/components/app-content';
import AppFooter from '@/components/app-footer';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import SubscriptionBanner from '@/components/Payment/SubscriptionBanner';
import SubscriptionModal from '@/components/Payment/SubscriptionModal';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ breadcrumbs = [], children }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant={'sidebar'}>
            <AppSidebar />
            <AppContent variant="sidebar">
                <SubscriptionBanner />
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="min-w-0 grow overflow-x-hidden">{children}</div>
                <AppFooter />
                <SubscriptionModal />
            </AppContent>
        </AppShell>
    );
}
