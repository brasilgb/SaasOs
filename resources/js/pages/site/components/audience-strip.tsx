import { Laptop, Smartphone, Tv } from 'lucide-react';

const audiences = [
    {
        icon: Smartphone,
        title: 'Celulares e Mobile',
        description: 'Para assistências que precisam acompanhar entrada, diagnóstico, aprovação, entrega e comunicação com o cliente.',
        support: 'Manual completo em português para apoiar a rotina da equipe.',
    },
    {
        icon: Laptop,
        title: 'Informática',
        description: 'Ideal para operações com notebooks, desktops e periféricos que exigem histórico técnico, organização e controle diário.',
        support: 'Manual completo em português para facilitar treinamento e consulta.',
    },
    {
        icon: Tv,
        title: 'Eletrônicos',
        description: 'Perfeito para quem atende eletrônicos em geral e quer mais previsibilidade no atendimento, financeiro e pós-serviço.',
        support: 'Manual completo em português com orientação prática para o uso da plataforma.',
    },
];

export function AudienceStrip() {
    return (
        <section className="border-b border-white/10 bg-[#081223] py-16 text-white sm:py-20">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1 text-[0.7rem] font-semibold tracking-[0.26em] text-[#ffd6a3] uppercase">
                        Posicionamento
                    </span>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Para quem o SigmaOS foi feito</h2>
                    <p className="mt-4 text-base leading-relaxed text-white/72 sm:text-lg">
                        Uma plataforma pensada para assistências técnicas que precisam de mais organização operacional, controle financeiro e
                        relacionamento com clientes.
                    </p>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {audiences.map((audience) => (
                        <article
                            key={audience.title}
                            className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#f1b555]/30 hover:bg-white/[0.07]"
                        >
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#f1b555]/20 bg-[#f1b555]/10">
                                <audience.icon className="h-6 w-6 text-[#ffc980]" />
                            </div>

                            <h3 className="mt-5 text-xl font-semibold text-white">{audience.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-white/70">{audience.description}</p>
                            <p className="mt-4 rounded-xl border border-[#f1b555]/18 bg-[#f1b555]/8 px-4 py-3 text-sm leading-relaxed text-[#ffe2b8]">
                                {audience.support}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
