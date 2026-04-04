import { SigmaOSHorizontalLogo } from '@/components/sigma-os-logo';
import { Link } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';

export function Footer() {
    return (
        <footer id="contato" className="border-border bg-muted/30 border-t py-16">
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Logo + descrição */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <SigmaOSHorizontalLogo />
                        </div>

                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Sistema de gestão de ordens de serviço para empresas de manutenção em informática, eletrônicos e eletrodomésticos.
                        </p>
                    </div>

                    {/* Produto */}
                    <div>
                        <h3 className="mb-4 font-semibold">Produto</h3>

                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#recursos" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Recursos
                                </a>
                            </li>

                            <li>
                                <a href="#precos" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Preços
                                </a>
                            </li>

                            <li>
                                <Link href={route('login')} className="text-muted-foreground hover:text-foreground transition-colors">
                                    Entrar
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Empresa */}
                    <div>
                        <h3 className="mb-4 font-semibold">Empresa</h3>

                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#contato" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Contato
                                </a>
                            </li>

                            <li>
                                <a href="/termos" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Termos de uso
                                </a>
                            </li>

                            <li>
                                <a href="/privacidade" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Política de privacidade
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Suporte */}
                    <div>
                        <h3 className="mb-4 font-semibold">Suporte</h3>

                        <ul className="space-y-3 text-sm">
                            <li>
                                <a
                                    href="https://wa.me/5551998931325?text=Quero%20mais%20informações%20sobre%20SigmaOs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    WhatsApp
                                </a>
                            </li>

                            <li>
                                <a href="mailto:suporte@sigmaos.com.br" className="text-muted-foreground hover:text-foreground transition-colors">
                                    suporte@sigmaos.com.br
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
                    <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} SigmaOs. Todos os direitos reservados.</p>

                    <div className="flex gap-6 text-sm">
                        <a href="/privacidade" className="text-muted-foreground hover:text-foreground transition-colors">
                            Privacidade
                        </a>

                        <a href="/termos" className="text-muted-foreground hover:text-foreground transition-colors">
                            Termos
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
