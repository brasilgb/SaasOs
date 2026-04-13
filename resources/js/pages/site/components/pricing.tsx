import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

const plans = [
    {
        name: 'Mensal',
        price: 'R$59',
        period: '/mês',
        description: 'Ideal para começar',
        cta: 'Começar agora',
        features: [
            'Todos os recursos incluídos',
            'Usuários ilimitados',
            'Aplicativo Android',
            'Suporte prioritário',
            'Atualizações automáticas',
            'Backup diário',
        ],
    },
    {
        name: 'Trimestral',
        price: 'R$159',
        period: 'a cada 3 meses',
        description: 'Economize pagando antecipado',
        savings: 'Economize R$18',
        highlight: 'Plano com 10% de desconto no ciclo.',
        cta: 'Escolher trimestral',
        features: [
            'Todos os recursos incluídos',
            'Usuários ilimitados',
            'Aplicativo Android',
            'Suporte prioritário',
            'Atualizações automáticas',
            'Backup diário',
            '10% de desconto',
        ],
    },
    {
        name: 'Semestral',
        price: 'R$297',
        period: 'a cada 6 meses',
        monthlyEquivalent: 'equivalente a R$49,50/mês',
        description: 'Melhor custo-benefício',
        savings: 'Economize R$57',
        highlight: 'Plano mais escolhido por quem quer pagar menos por mês.',
        popular: true,
        cta: 'Quero o semestral',
        features: [
            'Todos os recursos incluídos',
            'Usuários ilimitados',
            'Aplicativo Android',
            'Suporte prioritário',
            'Atualizações automáticas',
            'Backup diário',
            '16% de desconto',
        ],
    },
];

export function Pricing() {
    return (
        <section id="precos" className="relative overflow-hidden bg-[#060d18] py-20 text-white sm:py-32">
            <div className="absolute inset-0">
                <div className="absolute top-16 right-0 h-80 w-80 rounded-full bg-[#f1b555]/10 blur-3xl" />
                <div className="absolute inset-0 bg-linear-to-b from-[#07111f] via-[#081223] to-[#050a13]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4">
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1 text-[0.7rem] font-semibold tracking-[0.26em] text-[#ffd6a3] uppercase">
                        Planos transparentes
                    </span>

                    <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Preços simples e transparentes</h2>

                    <p className="mt-4 text-lg text-white/72">
                        Teste grátis por 14 dias, sem cartão de crédito e com ativação imediata.
                    </p>
                    <p className="mt-2 text-sm text-white/48">Depois do período de teste, você paga via Pix e pode cancelar sem burocracia.</p>
                </div>

                <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
                    {plans.map((plan, index) => (
                        <Card
                            key={index}
                            className={`relative border-white/10 bg-white/[0.045] text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#f1b555]/30 hover:bg-white/[0.07] hover:shadow-[0_22px_70px_rgba(0,0,0,0.28)] ${
                                plan.popular ? 'scale-105 border-2 border-[#f1b555]/50 bg-[#f1b555]/[0.08] shadow-[0_28px_90px_rgba(0,0,0,0.34)]' : ''
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="rounded-full bg-[#f1b555] px-4 py-1 text-sm font-semibold text-slate-950 shadow">
                                        Mais popular
                                    </span>
                                </div>
                            )}

                            <CardHeader className="pt-8 pb-6 text-center">
                                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>

                                <CardDescription className="mt-2 text-white/62">{plan.description}</CardDescription>

                                <div className="mt-6">
                                    <div className="text-5xl font-bold">{plan.price}</div>

                                    <div className="mt-1 text-white/52">{plan.period}</div>

                                    {plan.monthlyEquivalent && <div className="mt-2 text-sm text-white/52">{plan.monthlyEquivalent}</div>}

                                    {plan.savings && (
                                        <div className="mt-3">
                                            <span className="rounded-md border border-[#f1b555]/18 bg-[#f1b555]/10 px-2 py-1 text-xs font-medium text-[#ffd899]">
                                                {plan.savings}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="rounded-lg border border-dashed border-white/12 bg-black/10 p-2 text-center text-xs text-white/56">
                                    {plan.highlight ?? 'Todos os módulos liberados desde o primeiro dia.'}
                                </div>
                                {plan.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="flex items-start gap-3">
                                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#ffc980]" />

                                        <span className="text-sm leading-relaxed text-white/84">{feature}</span>
                                    </div>
                                ))}
                            </CardContent>

                            <CardFooter className="flex flex-col gap-3 pt-6">
                                <Link href={route('register')} className="w-full">
                                    <Button
                                        size="lg"
                                        className="w-full rounded-xl bg-[#f1b555] font-semibold text-slate-950 hover:bg-[#f5c06c]"
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>

                                <span className="text-xs text-white/45">14 dias grátis para testar tudo</span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <p className="mt-12 text-center text-sm text-white/48">
                    Todos os planos incluem os mesmos recursos, suporte em português e acesso completo desde o primeiro dia de teste.
                </p>
            </div>
        </section>
    );
}
