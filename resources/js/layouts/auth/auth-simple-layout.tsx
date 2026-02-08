import AuthLogoIcon from '@/components/auth-logo-icon';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import authImage from '@/images/auth-images.jpg';
interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
    width?: string;
}

export default function AuthSimpleLayout({ children, title, description, width = 'md:w-1/4 w-11/12' }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${authImage})`
                }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-black/75 via-black/80 to-black/75" />

            <Card className={`absolute border-border/50 shadow-2xl bg-background backdrop-blur-md ${width} md:p-8 p-4`}>
                {/* Logo */}
                <div className="top-8 left-8 z-10 flex flex-col items-center gap-3">
                    <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                        <div className="mb-2 flex items-center justify-center rounded-md">
                            <AuthLogoIcon className="size-9 fill-current text-foreground dark:text-white" />
                        </div>
                        <span className="sr-only">{title}</span>
                    </Link>


                    <CardHeader className="space-y-1 w-full">
                        <CardTitle className="text-2xl font-bold text-balance text-center">{title}</CardTitle>
                        <CardDescription className="text-base text-balance text-center">
                            {description}
                        </CardDescription>
                    </CardHeader>
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-md">
                    {children}
                </div>
            </Card>
        </div>
    );
}