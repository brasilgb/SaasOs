import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, LifeBuoy, Sparkles } from 'lucide-react';
import { ProductCarousel } from './product-carousel';

const onboardingSteps = [
    {
        icon: Sparkles,
        title: 'Ativação imediata',
        description: 'Você cria a conta, acessa o painel e já pode começar a cadastrar clientes, ordens e configurações iniciais.',
    },
    {
        icon: BookOpen,
        title: 'Manual navegável',
        description: 'O sistema já entrega um manual em HTML com busca interna, explicação de botões, status, e-mails e rotinas operacionais.',
    },
    {
        icon: LifeBuoy,
        title: 'Apoio na implantação',
        description: 'Sua equipe consegue aprender a usar o fluxo principal sem depender de vídeos, com suporte e documentação prática.',
    },
];

const operatingHighlights = [
    'Fluxo completo de OS, orçamento, cobrança e retirada',
    'Área pública do cliente com acompanhamento online',
    'Acompanhamentos, garantia, avaliações e métricas comerciais',
    'Financeiro, caixa, despesas, estoque e vendas no mesmo ambiente',
    'Notas fiscais para sua empresa, com NF-e de produtos e NFS-e de serviços mediante contratação do serviço fiscal',
];

export function OnboardingShowcase() {
    return (
        <section id="como-funciona" className="relative overflow-hidden bg-[#081223] py-20 text-white sm:py-28">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-[10%] h-56 w-56 rounded-full bg-[#f1b555]/12 blur-3xl" />
                <div className="absolute right-[8%] bottom-12 h-64 w-64 rounded-full bg-[#1c8f88]/14 blur-3xl" />
                <div className="absolute inset-0 bg-linear-to-b from-[#081223] via-[#09182d] to-[#060d18]" />
            </div>

            <div className="relative mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div>
                    <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1 text-[0.7rem] font-semibold tracking-[0.26em] text-[#ffd6a3] uppercase">
                        Como funciona na prática
                    </span>

                    <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                        Uma landing mais honesta, com onboarding real e manual acessível desde o início
                    </h2>

                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/72">
                        Em vez de prometer treinamento em vídeo que ainda não existe, o SigmaOS mostra o produto real: telas operacionais, fluxo da
                        rotina e um manual navegável para a equipe aprender com autonomia.
                    </p>

                    <div className="mt-8 grid gap-4">
                        {onboardingSteps.map((step) => (
                            <div
                                key={step.title}
                                className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_14px_42px_rgba(0,0,0,0.18)] backdrop-blur-sm"
                            >
                                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#f1b555]/24 bg-[#f1b555]/10">
                                    <step.icon className="h-5 w-5 text-[#ffd191]" />
                                </div>

                                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-white/68">{step.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 rounded-2xl border border-[#f1b555]/18 bg-[#f1b555]/8 p-6">
                        <p className="text-sm font-semibold tracking-[0.22em] text-[#ffd6a3] uppercase">O que sua equipe encontra</p>

                        <ul className="mt-4 space-y-3">
                            {operatingHighlights.map((item) => (
                                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-white/82">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ffd191]" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Button variant="outline" className="border-white/16 bg-white/8 text-white hover:bg-white/14 hover:text-white" asChild>
                                <a href="/documentation/doc-sigmaos.html" target="_blank" rel="noopener noreferrer">
                                    Abrir manual navegável
                                </a>
                            </Button>

                            <Button className="bg-[#f1b555] text-slate-950 hover:bg-[#f5c06c]" asChild>
                                <a href="#precos">Ver planos</a>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_26px_90px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-6">
                    <ProductCarousel />
                </div>
            </div>
        </section>
    );
}
