import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ProductCarousel } from './product-carousel';

export function Hero() {
    return (
        <section className="border-border bg-background relative overflow-hidden border-b py-20 sm:py-32">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <Badge variant="secondary" className="mb-6 text-sm">
                        <span className="bg-accent mr-2 inline-block h-2 w-2 rounded-full"></span>
                        14 dias grátis • Sem cartão de crédito
                    </Badge>

                    <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
                        Sistema de Ordem de Serviço para Assistência Técnica
                        <span className="text-primary block">sem planilhas e sem papel</span>
                    </h1>

                    <p className="text-muted-foreground mt-6 text-lg leading-relaxed sm:text-xl">
                        Gerencie clientes, ordens de serviço, equipamentos e estoque em um único sistema para assistência técnica de celulares,
                        informática e eletrônicos. Acesse do computador ou celular e organize sua empresa com facilidade.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link href={route('register')}>
                            <Button size="lg" className="flex items-center gap-2 text-base">
                                Começar Teste Grátis
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>

                    <div className="text-muted-foreground mt-12 flex flex-wrap items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="text-accent h-5 w-5" />
                            <span>Sem instalação</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="text-accent h-5 w-5" />
                            <span>App Android incluído</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="text-accent h-5 w-5" />
                            <span>Suporte em português</span>
                        </div>
                    </div>
                </div>

                {/* Product Preview */}

                <div className="mx-auto mt-16 max-w-5xl">
                    <div className="bg-card rounded-xl border p-2 shadow-xl">
                        <ProductCarousel />
                    </div>
                </div>
            </div>
        </section>
    );
}
