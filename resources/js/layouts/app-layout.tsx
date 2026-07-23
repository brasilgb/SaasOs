import { FlashToastMessages } from '@/components/flash-toast-messages';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';

interface AppLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
}

export default ({ breadcrumbs = [], children }: AppLayoutProps) => {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
            <FlashToastMessages />
            <Toaster theme="light" />
        </AppLayoutTemplate>
    );
};
