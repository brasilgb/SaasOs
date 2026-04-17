import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import authImage from '@/images/auth-images.jpg';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative overflow-hidden border-b bg-[#07111f]">
            <div className="absolute inset-0">
                <img src={authImage} alt="" aria-hidden="true" className="h-full w-full object-cover object-center opacity-70" />
                <div className="absolute inset-0 bg-linear-to-r from-[#07111f]/92 via-[#08182d]/58 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-b from-[#07111f]/18 via-transparent to-[#07111f]/68" />
            </div>

            <div className="relative mx-auto flex min-h-[78svh] max-w-7xl items-center px-4 py-20 sm:min-h-[88svh] sm:py-24">
                <div className="max-w-4xl text-white">
                    <Badge
                        variant="outline"
                        className="mb-6 rounded-full border-white/20 bg-white/8 px-5 py-2 text-[0.7rem] font-semibold tracking-[0.28em] text-[#ffd6a3] uppercase backdrop-blur-sm"
                    >
                        Estrutura completa para sua assistência
                    </Badge>

                    <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                        Organize sua
                        <span className="block text-[#ffc980]">assistência técnica</span>
                        com mais controle.
                    </h1>

                    <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/72 sm:text-xl">
                        Centralize atendimento, ordens, clientes, estoque, vendas, financeiro e acompanhamento do cliente em uma operação mais
                        rápida, previsível e profissional.
                    </p>

                    <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                        <Button
                            size="lg"
                            className="h-14 rounded-xl bg-[#f1b555] px-8 text-base font-semibold text-slate-950 shadow-[0_20px_50px_rgba(241,181,85,0.18)] hover:bg-[#f5c06c]"
                            asChild
                        >
                            <Link href={route('register')}>
                                Começar teste grátis
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 rounded-xl border-white/18 bg-white/8 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/14 hover:text-white"
                            asChild
                        >
                            <a href="#recursos">Ver recursos</a>
                        </Button>
                    </div>

                    <p className="mt-5 max-w-2xl text-sm text-white/55 sm:text-base">
                        Teste por 14 dias, sem cartão de crédito, e veja como a rotina da equipe fica mais clara desde o primeiro acesso.
                    </p>
                </div>
            </div>
        </section>
    );
}
