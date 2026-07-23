import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import authImage from '@/images/auth-images.jpg';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
            <div className="absolute inset-0">
                <img
                    src={authImage}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover object-[68%_center] opacity-10 sm:object-center sm:opacity-16"
                />
                <div className="absolute inset-0 bg-linear-to-r from-white via-white/92 to-white/40" />
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white" />
            </div>

            <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-5 py-20 sm:px-8 lg:min-h-[760px] lg:px-12">
                <div className="max-w-3xl text-slate-950">
                    <Badge
                        variant="outline"
                        className="mb-6 inline-flex max-w-full rounded-full border-blue-200 bg-blue-50 px-4 py-2 text-[0.68rem] font-bold tracking-[0.18em] text-blue-700 uppercase"
                    >
                        Plataforma web + apps móveis para sua assistência
                    </Badge>

                    <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
                        Organize sua
                        <span className="block text-blue-700">assistência técnica</span>
                        com mais controle.
                    </h1>

                    <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg lg:text-xl">
                        Descomplicamos a gestão da sua assistência técnica — inclusive para quem está começando agora e precisa de um sistema
                        simples, produtivo e que caiba no bolso. Organize atendimentos, ordens de serviço, clientes e financeiro em um só lugar.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                        <Button
                            size="lg"
                            className="h-12 w-full rounded-lg bg-blue-700 px-6 text-sm font-bold text-white shadow-lg shadow-blue-700/15 hover:bg-blue-800 sm:h-14 sm:w-auto sm:px-8 sm:text-base"
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
                            className="h-12 w-full rounded-lg border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 sm:h-14 sm:w-auto sm:px-8 sm:text-base"
                            asChild
                        >
                            <a href="#recursos">Ver recursos</a>
                        </Button>
                    </div>

                    <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                        Teste por 14 dias, sem cartão de crédito, e veja como a rotina da equipe fica mais clara no sistema web e nos apps de apoio.
                    </p>
                </div>
            </div>
        </section>
    );
}
