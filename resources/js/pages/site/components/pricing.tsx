import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

const plans = [
    {
        name: 'Mensal',
        price: 'R$49,90',
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
        name: 'Anual',
        price: 'R$419,16',
        period: '/ano',
        monthlyEquivalent: 'equivalente a R$34,93/mês',
        description: 'Economia máxima durante todo o ano',
        savings: '30% de desconto • economize R$179,64',
        highlight: 'Doze meses com 30% de desconto sobre o valor mensal.',
        popular: true,
        cta: 'Quero o anual',
        features: [
            'Todos os recursos incluídos',
            'Usuários ilimitados',
            'Aplicativo Android',
            'Suporte prioritário',
            'Atualizações automáticas',
            'Backup diário',
            '30% de desconto no pagamento anual',
        ],
    },
];

export function Pricing() {
    return (
        <section id="precos" className="border-y border-slate-200 bg-slate-50 py-24 text-slate-900 sm:py-32">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <p className="text-sm font-bold text-blue-700">Planos transparentes</p>

                    <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">Preços simples e transparentes</h2>

                    <p className="mt-5 text-lg leading-8 text-slate-600">Teste grátis por 14 dias, sem cartão de crédito e com ativação imediata.</p>
                    <p className="mt-2 text-sm text-slate-500">Depois do período de teste, você paga via Pix e pode cancelar sem burocracia.</p>
                </div>

                <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
                    {plans.map((plan, index) => (
                        <Card
                            key={index}
                            className={`relative border-slate-200 bg-white text-slate-950 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5 ${
                                plan.popular ? 'border-2 border-blue-700 shadow-xl shadow-blue-700/10 md:scale-105' : ''
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="rounded-full bg-blue-700 px-4 py-1 text-sm font-bold text-white shadow">Mais popular</span>
                                </div>
                            )}

                            <CardHeader className="pt-8 pb-6 text-center">
                                <CardTitle className="text-2xl text-slate-950">{plan.name}</CardTitle>

                                <CardDescription className="mt-2 text-slate-500">{plan.description}</CardDescription>

                                <div className="mt-6">
                                    <div className="text-5xl font-bold">{plan.price}</div>

                                    <div className="mt-1 text-slate-500">{plan.period}</div>

                                    {plan.monthlyEquivalent && <div className="mt-2 text-sm text-slate-500">{plan.monthlyEquivalent}</div>}

                                    {plan.savings && (
                                        <div className="mt-3">
                                            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                                                {plan.savings}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-2 text-center text-xs text-slate-500">
                                    {plan.highlight ?? 'Todos os módulos liberados desde o primeiro dia.'}
                                </div>
                                {plan.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="flex items-start gap-3">
                                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

                                        <span className="text-sm leading-relaxed text-slate-700">{feature}</span>
                                    </div>
                                ))}
                            </CardContent>

                            <CardFooter className="flex flex-col gap-3 pt-6">
                                <Link href={route('register')} className="w-full">
                                    <Button size="lg" className="w-full rounded-lg bg-blue-700 font-bold text-white hover:bg-blue-800">
                                        {plan.cta}
                                    </Button>
                                </Link>

                                <span className="text-xs text-slate-400">14 dias grátis para testar tudo</span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <p className="mt-12 text-center text-sm text-slate-500">
                    Todos os planos incluem os mesmos recursos, suporte em português e acesso completo desde o primeiro dia de teste.
                </p>
            </div>
        </section>
    );
}
