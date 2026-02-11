
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { useAppearance } from '@/hooks/use-appearance';
import SubscriptionModal from '@/components/Payment/SubscriptionModal';

interface AppLayoutProps {
    children: ReactNode;
}

export default ({ children }: AppLayoutProps) => {
    const { appearance } = useAppearance();

    return (
        <AppLayoutTemplate>        
            {children}
            <Toaster theme={appearance} />
        </AppLayoutTemplate>
    )
};