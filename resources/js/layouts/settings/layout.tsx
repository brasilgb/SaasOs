import { Breadcrumbs } from '@/components/breadcrumbs';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Perfil',
        href: '/settings/profile',
        icon: null,
    },
    {
        title: 'Senha',
        href: '/settings/password',
        icon: null,
    },
    {
        title: 'Aparência',
        href: '/settings/appearance',
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('app.dashboard'),
        },
        {
            title: 'Configurações',
            href: currentPath,
        },
    ];

    return (
        <div className="w-full max-w-none px-4 py-6">
            <div className="flex w-full flex-col gap-3 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <Heading title="Configurações" description="Gerencie seu perfil, senha e preferências da conta" />
                <div className="sm:ml-auto sm:text-right">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex w-full max-w-none flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
                <aside className="w-full rounded-2xl border bg-card p-3 lg:sticky lg:top-6 lg:w-60 lg:min-w-60">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${item.href}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start rounded-xl px-3 py-2 text-sm', {
                                    'bg-muted font-medium text-foreground': currentPath === item.href,
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="w-full max-w-none flex-1">
                    <section className="w-full max-w-none rounded-2xl border bg-card p-5 sm:p-6">{children}</section>
                </div>
            </div>
        </div>
    );
}
