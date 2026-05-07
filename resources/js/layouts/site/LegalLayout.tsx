import { SigmaOSHorizontalLogo } from '@/components/sigma-os-logo';
import { Link } from '@inertiajs/react';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background flex min-h-screen min-w-0 flex-col overflow-x-hidden">
            {/* Header */}
            <header className="border-border border-b">
                <div className="mx-auto flex max-w-5xl min-w-0 items-center justify-between px-4 py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <SigmaOSHorizontalLogo />
                    </Link>
                </div>
            </header>

            {/* Conteúdo */}
            <main className="flex-1">
                <div className="mx-auto max-w-3xl min-w-0 px-4 py-8 sm:py-12">{children}</div>
            </main>

            {/* Footer */}
            <footer className="border-border border-t">
                <div className="text-muted-foreground mx-auto flex max-w-5xl min-w-0 flex-col justify-between gap-3 px-4 py-6 text-sm sm:flex-row">
                    <p>© {new Date().getFullYear()} SigmaOS</p>

                    <div className="flex gap-6">
                        <Link href="/privacidade">Privacidade</Link>

                        <Link href="/termos">Termos</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
