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
        <section className="border-b border-slate-200 bg-white py-24 text-slate-900 sm:py-32">
            <div className="mx-auto max-w-[86rem] px-5 sm:px-8 lg:px-12">
                <div className="max-w-3xl">
                    <p className="flex items-center gap-3 text-xs font-extrabold tracking-[0.18em] text-blue-700 uppercase before:h-px before:w-8 before:bg-blue-600">
                        Feito para sua realidade
                    </p>
                    <h2 className="mt-5 text-4xl leading-[1.02] font-black tracking-[-0.055em] text-balance text-slate-950 sm:text-6xl">
                        Para quem o VetorOS foi feito
                    </h2>
                    <p className="mt-5 text-lg leading-8 text-slate-600">
                        Uma plataforma pensada para assistências técnicas que precisam organizar recepção, bancada, campo, financeiro e relacionamento
                        com clientes.
                    </p>
                </div>

                <div className="mt-14 grid border-y border-slate-300 md:grid-cols-3 md:divide-x md:divide-slate-300">
                    {audiences.map((audience) => (
                        <article key={audience.title} className="group px-2 py-9 md:px-8">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 transition group-hover:bg-cyan-200">
                                <audience.icon className="h-6 w-6 text-blue-700" />
                            </div>

                            <h3 className="mt-5 text-xl font-bold text-slate-950">{audience.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{audience.description}</p>
                            <p className="mt-5 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-500">{audience.support}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
