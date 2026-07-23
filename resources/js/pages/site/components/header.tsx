import { Button } from '@/components/ui/button';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { BrandHorizontalLogo } from '@/components/brand-logo';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
    const { auth } = usePage().props as any;

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuToggle = () => setIsMenuOpen((prev) => !prev);

    const handleLinkClick = () => setIsMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 text-slate-900 shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <BrandHorizontalLogo />
                </Link>

                {/* Menu Desktop */}
                <nav className="hidden items-center gap-6 md:flex">
                    <a
                        href="/#recursos"
                        onClick={handleLinkClick}
                        className="text-sm font-semibold text-slate-600 transition-colors hover:text-blue-700"
                    >
                        Recursos
                    </a>

                    <Link
                        href={route('plans.index')}
                        onClick={handleLinkClick}
                        className="text-sm font-semibold text-slate-600 transition-colors hover:text-blue-700"
                    >
                        Planos
                    </Link>

                    <a
                        href="/#contato"
                        onClick={handleLinkClick}
                        className="text-sm font-semibold text-slate-600 transition-colors hover:text-blue-700"
                    >
                        Contato
                    </a>
                </nav>

                {/* Ações */}
                <div className="flex items-center gap-4">
                    <AppearanceToggleDropdown />
                    {auth?.user ? (
                        <Link href={route(`${auth?.user?.tenant_id === null ? 'admin.dashboard' : 'app.dashboard'}`)} className="hidden md:inline">
                            <Button variant="ghost">{auth.user.name}</Button>
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-blue-700 md:inline">
                                Entrar
                            </Link>

                            <Link href={route('plans.index')}>
                                <Button className="rounded-lg bg-blue-700 font-semibold text-white hover:bg-blue-800">Testar grátis</Button>
                            </Link>
                        </>
                    )}

                    {/* Botão menu mobile */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950 md:hidden"
                        onClick={handleMenuToggle}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-site-menu"
                        aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Menu Mobile */}
            {isMenuOpen && (
                <div id="mobile-site-menu" className="mx-auto max-w-7xl border-t border-slate-100 bg-white px-5 py-5 md:hidden">
                    <nav className="flex flex-col gap-4">
                        <a
                            href="/#recursos"
                            onClick={handleLinkClick}
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                        >
                            Recursos
                        </a>

                        <Link
                            href={route('plans.index')}
                            onClick={handleLinkClick}
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                        >
                            Planos
                        </Link>

                        <a
                            href="/#contato"
                            onClick={handleLinkClick}
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                        >
                            Contato
                        </a>
                    </nav>

                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
                        {auth?.user ? (
                            <Link href={route(`${auth?.user?.tenant_id === null ? 'admin.dashboard' : 'app.dashboard'}`)} onClick={handleLinkClick}>
                                <Button className="w-full">{auth.user.name}</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} onClick={handleLinkClick}>
                                    <Button variant="outline" className="w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                                        Entrar
                                    </Button>
                                </Link>

                                <Link href={route('plans.index')} onClick={handleLinkClick}>
                                    <Button className="w-full bg-blue-700 font-semibold text-white hover:bg-blue-800">Testar grátis</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
