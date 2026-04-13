import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowRight, MessageCircle } from 'lucide-react';

export function CTA() {
    return (
        <section className="relative overflow-hidden bg-[#07111f] py-20 text-white sm:py-32">
            <div className="absolute inset-0">
                <div className="absolute left-1/2 h-full w-full -translate-x-1/2 bg-linear-to-r from-[#07111f] via-[#0b1830] to-[#102142]" />
                <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f1b555]/14 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4">
                <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.045] px-6 py-12 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:px-10">
                    <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1 text-[0.7rem] font-semibold tracking-[0.26em] text-[#ffd6a3] uppercase">
                        Teste completo
                    </span>

                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pronto para transformar sua gestão?</h2>

                    <p className="mt-6 text-lg leading-relaxed text-white/76">
                        Centralize ordens de serviço, estoque, financeiro e atendimento em um único sistema. Teste o SigmaOs gratuitamente por 14 dias.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button size="lg" className="gap-2 rounded-xl bg-[#f1b555] px-8 text-base font-semibold text-slate-950 hover:bg-[#f5c06c]" asChild>
                            <Link href={route('register')}>
                                Começar teste grátis
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="gap-2 rounded-xl border-white/18 bg-white/8 px-8 text-base font-semibold text-white hover:bg-white/14 hover:text-white"
                            asChild
                        >
                            <a
                                href="https://wa.me/5551998931325?text=Quero%20mais%20informações%20sobre%20SigmaOs"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Falar no WhatsApp
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
