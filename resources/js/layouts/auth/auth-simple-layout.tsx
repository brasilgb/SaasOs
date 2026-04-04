import { SigmaOSLoginLogo } from '@/components/sigma-os-logo';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import authImage from '@/images/auth-images.jpg';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
    width?: string;
}

export default function AuthSimpleLayout({ children, title, description, width = 'md:w-1/4 w-11/12' }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${authImage})`,
                }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-black/75 via-black/80 to-black/75" />

            <Card className={`border-border/50 bg-background/95 relative z-10 shadow-2xl backdrop-blur-md ${width} flex max-h-[90vh] flex-col`}>
                {/* Logo */}
                <div className="top-8 left-8 z-10 flex flex-col items-center gap-3">
                    <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                        <div className="mb-2 flex items-center justify-center rounded-md">
                            <SigmaOSLoginLogo />
                        </div>
                        <span className="sr-only">{title}</span>
                    </Link>

                    <CardHeader className="w-full space-y-1">
                        <CardTitle className="text-center text-2xl font-bold text-balance">{title}</CardTitle>
                        <CardDescription className="text-center text-base text-balance">{description}</CardDescription>
                    </CardHeader>
                </div>
                {/* Content */}
                <div className="scrollbar-thin scrollbar-thumb-border relative z-10 w-full overflow-y-auto pr-2">{children}</div>
            </Card>
        </div>
    );
}
