import { useAppearance } from '@/hooks/use-appearance';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { FlashToastMessages } from '@/components/flash-toast-messages';

interface AppLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
}

export default ({ breadcrumbs = [], children }: AppLayoutProps) => {
    const { appearance } = useAppearance();

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
            <FlashToastMessages />
            <Toaster theme={appearance} />
        </AppLayoutTemplate>
    );
};
