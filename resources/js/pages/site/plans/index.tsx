import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { Footer } from '../components/footer';
import { Header } from '../components/header';
import { Pricing } from '../components/pricing';

const benefits = [
    'Controle financeiro, vendas e prestação de serviços',
    'Ordens de serviço e relacionamento com clientes',
    'Acesso completo durante 14 dias',
    'Sem cartão de crédito e sem API fiscal obrigatória',
];

export default function Plans() {
    return (
        <main className="min-h-screen bg-[#0B1220] text-white">
            <Head title="Planos" />
            <Header />

            <section className="relative overflow-hidden px-4 pt-20 pb-8 text-center sm:pt-28 sm:pb-12">
                <div className="absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#00E59B]/10 blur-3xl" />
                <div className="relative mx-auto max-w-4xl">
                    <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1 text-xs font-semibold tracking-[0.22em] text-[#7ee7ff] uppercase">
                        Planos simples e transparentes
                    </span>
                    <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Escolha a melhor forma de usar o VetorOS</h1>
                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/76">
                        Simplifique as operações diárias da sua empresa de manutenção e mantenha atendimento, serviços e financeiro organizados em
                        um só lugar.
                    </p>

                    <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-2">
                        {benefits.map((benefit) => (
                            <div key={benefit} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/82">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#00E59B]" />
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>

                    <Button asChild size="lg" className="mt-9 bg-[#00E59B] font-semibold text-slate-950 hover:bg-[#2ff0b1]">
                        <Link href={route('register')}>
                            Testar grátis por 14 dias
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>

            <Pricing />

            <section className="border-t border-white/10 bg-[#08101d] px-4 py-16 text-center">
                <h2 className="text-2xl font-bold">Ainda tem dúvidas?</h2>
                <p className="mt-3 text-white/62">Converse diretamente com nossa equipe antes de começar.</p>
                <Button asChild variant="outline" size="lg" className="mt-6 border-white/16 bg-white/6 text-white hover:bg-white/12 hover:text-white">
                    <a href="https://wa.me/5551998931325?text=Quero%20mais%20informações%20sobre%20VetorOS" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Falar no WhatsApp
                    </a>
                </Button>
            </section>

            <Footer />
        </main>
    );
}
