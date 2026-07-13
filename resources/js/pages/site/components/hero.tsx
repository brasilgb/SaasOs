import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import authImage from '@/images/auth-images.jpg';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative overflow-hidden border-b bg-[#0B1220]">
            <div className="absolute inset-0">
                <img
                    src={authImage}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover object-[68%_center] opacity-55 sm:object-center sm:opacity-70"
                />
                <div className="absolute inset-0 bg-linear-to-b from-[#0B1220]/28 via-[#0B1220]/78 to-[#0B1220]/96 sm:bg-linear-to-r sm:from-[#0B1220]/92 sm:via-[#0D47A1]/58 sm:to-transparent" />
                <div className="absolute inset-0 bg-linear-to-b from-[#0B1220]/12 via-transparent to-[#0B1220]/72" />
            </div>

            <div className="relative mx-auto flex min-h-[100vh] max-w-7xl items-center px-4 py-16 sm:min-h-[78svh] sm:px-6 sm:py-20 lg:min-h-[88svh] lg:px-8 lg:py-24">
                <div className="max-w-4xl text-white">
                    <Badge
                        variant="outline"
                        className="mb-5 inline-flex max-w-full rounded-full border-white/20 bg-white/8 px-3 py-1.5 text-[0.62rem] font-semibold tracking-[0.2em] text-[#7ee7ff] uppercase backdrop-blur-sm sm:mb-6 sm:px-5 sm:py-2 sm:text-[0.7rem] sm:tracking-[0.28em]"
                    >
                        Plataforma web + apps móveis para sua assistência
                    </Badge>

                    <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
                        Organize sua
                        <span className="block text-[#00B4FF]">assistência técnica</span>
                        com mais controle.
                    </h1>

                    <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/72 sm:mt-6 sm:text-lg lg:text-xl">
                        Descomplicamos a gestão da sua assistência técnica — inclusive para quem está começando agora e precisa de um sistema
                        simples, produtivo e que caiba no bolso. Organize atendimentos, ordens de serviço, clientes e financeiro em um só lugar.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                        <Button
                            size="lg"
                            className="h-12 w-full rounded-xl bg-[#00E59B] px-6 text-sm font-semibold text-slate-950 shadow-[0_20px_50px_rgba(0,229,155,0.18)] hover:bg-[#2ff0b1] sm:h-14 sm:w-auto sm:px-8 sm:text-base"
                            asChild
                        >
                            <Link href={route('plans.index')}>
                                Conhecer planos
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="h-12 w-full rounded-xl border-white/18 bg-white/8 px-6 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/14 hover:text-white sm:h-14 sm:w-auto sm:px-8 sm:text-base"
                            asChild
                        >
                            <a href="#recursos">Ver recursos</a>
                        </Button>
                    </div>

                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:mt-5 sm:text-base">
                        Teste por 14 dias, sem cartão de crédito, e veja como a rotina da equipe fica mais clara no sistema web e nos apps de apoio.
                    </p>
                </div>
            </div>
        </section>
    );
}
