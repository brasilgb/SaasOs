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
        <section className="border-b border-slate-200 bg-slate-50 py-20 text-slate-900 sm:py-24">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-bold text-blue-700">Feito para sua realidade</p>
                    <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-balance text-slate-950 sm:text-5xl">
                        Para quem o VetorOS foi feito
                    </h2>
                    <p className="mt-5 text-lg leading-8 text-slate-600">
                        Uma plataforma pensada para assistências técnicas que precisam organizar recepção, bancada, campo, financeiro e relacionamento
                        com clientes.
                    </p>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {audiences.map((audience) => (
                        <article
                            key={audience.title}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5"
                        >
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
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
