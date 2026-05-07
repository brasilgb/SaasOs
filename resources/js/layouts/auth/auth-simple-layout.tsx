import { SigmaOSLoginLogo } from '@/components/sigma-os-logo';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import authImage from '@/images/auth-images.jpg';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
    width?: string;
}

export default function AuthSimpleLayout({ children, title, description, width = 'w-full max-w-md' }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh min-w-0 items-center justify-center overflow-hidden p-3 sm:p-6">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${authImage})`,
                }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-black/75 via-black/80 to-black/75" />

            <Card className={cn('border-border/50 bg-background/95 relative z-10 max-h-[calc(100svh-1.5rem)] min-w-0 shadow-2xl backdrop-blur-md sm:max-h-[calc(100svh-3rem)]', width)}>
                {/* Logo */}
                <div className="top-8 left-8 z-10 flex min-w-0 flex-col items-center gap-3 px-3 sm:px-6">
                    <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                        <div className="mb-2 flex items-center justify-center rounded-md">
                            <SigmaOSLoginLogo />
                        </div>
                        <span className="sr-only">{title}</span>
                    </Link>

                    <CardHeader className="w-full space-y-1 px-0">
                        <CardTitle className="text-center text-xl font-bold text-balance sm:text-2xl">{title}</CardTitle>
                        <CardDescription className="text-center text-base text-balance">{description}</CardDescription>
                    </CardHeader>
                </div>
                {/* Content */}
                <div className="scrollbar-thin scrollbar-thumb-border relative z-10 min-w-0 overflow-y-auto px-3 sm:px-6">{children}</div>
            </Card>
        </div>
    );
}
