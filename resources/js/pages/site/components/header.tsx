import { Button } from '@/components/ui/button';
import { Head, Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
    const { auth } = usePage().props as any;

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuToggle = () => setIsMenuOpen((prev) => !prev);

    const handleLinkClick = () => setIsMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#07111f] text-white shadow-sm">
            <Head title="Início" />

            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <img
                        src="/logos/sigmaos-horizontal-dark.png"
                        alt="SigmaOS - Sistema de Ordens de Serviço"
                        width={150}
                        height={38}
                        className="transition-all duration-300"
                    />
                </Link>

                {/* Menu Desktop */}
                <nav className="hidden items-center gap-6 md:flex">
                    <a
                        href="#recursos"
                        onClick={handleLinkClick}
                        className="text-sm font-medium text-white/62 transition-colors hover:text-white"
                    >
                        Recursos
                    </a>

                    <a
                        href="#precos"
                        onClick={handleLinkClick}
                        className="text-sm font-medium text-white/62 transition-colors hover:text-white"
                    >
                        Preços
                    </a>

                    <a
                        href="#contato"
                        onClick={handleLinkClick}
                        className="text-sm font-medium text-white/62 transition-colors hover:text-white"
                    >
                        Contato
                    </a>
                </nav>

                {/* Ações */}
                <div className="flex items-center gap-4">
                    {auth?.user ? (
                        <Link href={route(`${auth?.user?.tenant_id === null ? 'admin.dashboard' : 'app.dashboard'}`)} className="hidden md:inline">
                            <Button variant="ghost">{auth.user.name}</Button>
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="hidden text-sm font-medium text-white/62 transition-colors hover:text-white md:inline">
                                Entrar
                            </Link>

                            <Link href={route('register')}>
                                <Button className="bg-[#f1b555] font-semibold text-slate-950 hover:bg-[#f5c06c]">Começar Grátis</Button>
                            </Link>
                        </>
                    )}

                    {/* Botão menu mobile */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 hover:text-white md:hidden"
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
                <div id="mobile-site-menu" className="mx-auto max-w-7xl border-t border-white/10 px-4 pb-4 md:hidden">
                    <nav className="flex flex-col gap-4">
                        <a
                            href="#recursos"
                            onClick={handleLinkClick}
                            className="text-sm font-medium text-white/62 transition-colors hover:text-white"
                        >
                            Recursos
                        </a>

                        <a
                            href="#precos"
                            onClick={handleLinkClick}
                            className="text-sm font-medium text-white/62 transition-colors hover:text-white"
                        >
                            Preços
                        </a>

                        <a
                            href="#contato"
                            onClick={handleLinkClick}
                            className="text-sm font-medium text-white/62 transition-colors hover:text-white"
                        >
                            Contato
                        </a>
                    </nav>

                    <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
                        {auth?.user ? (
                            <Link href={route(`${auth?.user?.tenant_id === null ? 'admin.dashboard' : 'app.dashboard'}`)} onClick={handleLinkClick}>
                                <Button className="w-full">{auth.user.name}</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} onClick={handleLinkClick}>
                                    <Button variant="outline" className="w-full border-white/14 bg-white/6 text-white hover:bg-white/12 hover:text-white">
                                        Entrar
                                    </Button>
                                </Link>

                                <Link href={route('register')} onClick={handleLinkClick}>
                                    <Button className="w-full bg-[#f1b555] font-semibold text-slate-950 hover:bg-[#f5c06c]">Começar Grátis</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
