import { BrandHorizontalLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
    const { auth } = usePage().props as any;

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuToggle = () => setIsMenuOpen((prev) => !prev);

    const handleLinkClick = () => setIsMenuOpen(false);

    return (
        <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-white/10 bg-[#08111f]/90 text-white backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-[86rem] items-center justify-between px-5 sm:px-8 lg:px-12">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <BrandHorizontalLogo inverse />
                </Link>

                {/* Menu Desktop */}
                <nav className="hidden items-center gap-8 lg:flex">
                    <a
                        href="/#recursos"
                        onClick={handleLinkClick}
                        className="text-sm font-semibold text-slate-300 transition-colors hover:text-white"
                    >
                        Recursos
                    </a>

                    <Link
                        href={route('plans.index')}
                        onClick={handleLinkClick}
                        className="text-sm font-semibold text-slate-300 transition-colors hover:text-white"
                    >
                        Planos
                    </Link>

                    <a href="/#contato" onClick={handleLinkClick} className="text-sm font-semibold text-slate-300 transition-colors hover:text-white">
                        Contato
                    </a>
                </nav>

                {/* Ações */}
                <div className="flex items-center gap-4">
                    {auth?.user ? (
                        <Link href={route(`${auth?.user?.tenant_id === null ? 'admin.dashboard' : 'app.dashboard'}`)} className="hidden sm:inline">
                            <Button className="rounded-full bg-cyan-300 px-5 font-extrabold text-slate-950 hover:bg-cyan-200">
                                {auth.user.name}
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="hidden text-sm font-semibold text-slate-300 transition-colors hover:text-white sm:inline"
                            >
                                Entrar
                            </Link>

                            <Link href={route('plans.index')} className="hidden sm:block">
                                <Button className="rounded-full bg-cyan-300 px-5 font-extrabold text-slate-950 hover:bg-cyan-200">
                                    Testar grátis
                                    <ArrowUpRight className="size-4" />
                                </Button>
                            </Link>
                        </>
                    )}

                    {/* Botão menu mobile */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full border border-white/15 text-white hover:bg-white/10 hover:text-white lg:hidden"
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
                <div id="mobile-site-menu" className="mx-auto max-w-[86rem] border-t border-white/10 bg-[#08111f] px-5 py-5 lg:hidden">
                    <nav className="flex flex-col gap-4">
                        <a
                            href="/#recursos"
                            onClick={handleLinkClick}
                            className="border-b border-white/10 px-3 py-3 text-sm font-semibold text-slate-300 hover:text-white"
                        >
                            Recursos
                        </a>

                        <Link
                            href={route('plans.index')}
                            onClick={handleLinkClick}
                            className="border-b border-white/10 px-3 py-3 text-sm font-semibold text-slate-300 hover:text-white"
                        >
                            Planos
                        </Link>

                        <a
                            href="/#contato"
                            onClick={handleLinkClick}
                            className="border-b border-white/10 px-3 py-3 text-sm font-semibold text-slate-300 hover:text-white"
                        >
                            Contato
                        </a>
                    </nav>

                    <div className="mt-4 flex flex-col gap-3 pt-2">
                        {auth?.user ? (
                            <Link href={route(`${auth?.user?.tenant_id === null ? 'admin.dashboard' : 'app.dashboard'}`)} onClick={handleLinkClick}>
                                <Button className="w-full">{auth.user.name}</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} onClick={handleLinkClick}>
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                    >
                                        Entrar
                                    </Button>
                                </Link>

                                <Link href={route('plans.index')} onClick={handleLinkClick}>
                                    <Button className="w-full rounded-full bg-cyan-300 font-extrabold text-slate-950 hover:bg-cyan-200">
                                        Testar grátis
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
