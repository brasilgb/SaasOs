import { Laptop, Smartphone, Tv } from 'lucide-react';

const audiences = [
    {
        icon: Smartphone,
        title: 'Celulares e Mobile',
        description: 'Para assistências que precisam acompanhar entrada, diagnóstico, fotos, aprovação, entrega e comunicação com o cliente.',
        support: 'Apps de atendimento e imagens ajudam a reduzir retrabalho na recepção e na documentação da OS.',
    },
    {
        icon: Laptop,
        title: 'Informática',
        description: 'Ideal para operações com notebooks, desktops e periféricos que exigem histórico técnico, agenda e controle diário.',
        support: 'O app técnico apoia visitas externas, check-in, checklist e relatório do serviço executado.',
    },
    {
        icon: Tv,
        title: 'Eletrônicos',
        description: 'Perfeito para quem atende eletrônicos em geral e quer mais previsibilidade no atendimento, financeiro e pós-serviço.',
        support: 'A plataforma web conecta OS, financeiro, imagens, área do cliente e rotina da equipe em campo.',
    },
];

export function AudienceStrip() {
    return (
        <section className="public-light-section border-b border-slate-200 bg-slate-50 py-16 text-slate-900 sm:py-24">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1 text-[0.7rem] font-semibold tracking-[0.26em] text-[#7ee7ff] uppercase">
                        Posicionamento
                    </span>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Para quem o VetorOS foi feito</h2>
                    <p className="mt-4 text-base leading-relaxed text-white/72 sm:text-lg">
                        Uma plataforma pensada para assistências técnicas que precisam organizar recepção, bancada, campo, financeiro e
                        relacionamento com clientes.
                    </p>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {audiences.map((audience) => (
                        <article
                            key={audience.title}
                            className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00E59B]/30 hover:bg-white/[0.07]"
                        >
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#00E59B]/20 bg-[#00E59B]/10">
                                <audience.icon className="h-6 w-6 text-[#00B4FF]" />
                            </div>

                            <h3 className="mt-5 text-xl font-semibold text-white">{audience.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-white/70">{audience.description}</p>
                            <p className="mt-4 rounded-xl border border-[#00E59B]/18 bg-[#00E59B]/8 px-4 py-3 text-sm leading-relaxed text-[#9ff3d8]">
                                {audience.support}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
