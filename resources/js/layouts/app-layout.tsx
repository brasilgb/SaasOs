
import { useAppearance } from '@/hooks/use-appearance';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';

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