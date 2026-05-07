import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ variant = 'header', children, className, ...props }: AppContentProps) {
    if (variant === 'sidebar') {
        return (
            <SidebarInset className={cn('min-w-0 overflow-x-hidden', className)} {...props}>
                {children}
            </SidebarInset>
        );
    }

    return (
        <main className={cn('container mx-auto flex h-full w-full min-w-0 flex-1 flex-col gap-4 overflow-x-hidden rounded-xl', className)} {...props}>
            {children}
        </main>
    );
}
