import { AppContent } from '@/components/app-content';
import AppFooter from '@/components/app-footer';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import SubscriptionBanner from '@/components/Payment/SubscriptionBanner';
import SubscriptionModal from '@/components/Payment/SubscriptionModal';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children }: PropsWithChildren) {

    return (
        <AppShell variant={"sidebar"}>
            <AppSidebar />
            <AppContent variant="sidebar">
                <SubscriptionBanner />
                <AppSidebarHeader />
                <div className='grow'>
                    {children}
                </div>
                <AppFooter />
                <SubscriptionModal />
            </AppContent>
        </AppShell>
    );
}
