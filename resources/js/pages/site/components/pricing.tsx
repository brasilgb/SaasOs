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
        <section id="precos" className="bg-background py-20 sm:py-32">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Preços simples e transparentes</h2>

                    <p className="text-muted-foreground mt-4 text-lg">
                        Teste gratuito por 14 dias • Sem cartão de crédito • Pagamento simples via Pix
                    </p>
                    <p className="text-muted-foreground mt-2 text-sm">Ativação imediata, suporte humano e cancelamento sem burocracia.</p>
                </div>

                <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
                    {plans.map((plan, index) => (
                        <Card
                            key={index}
                            className={`relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                plan.popular ? 'border-primary bg-primary/5 scale-105 border-2 shadow-2xl' : ''
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-primary-foreground rounded-full px-4 py-1 text-sm font-semibold shadow">
                                        Mais popular
                                    </span>
                                </div>
                            )}

                            <CardHeader className="pt-8 pb-6 text-center">
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>

                                <CardDescription className="mt-2">{plan.description}</CardDescription>

                                <div className="mt-6">
                                    <div className="text-5xl font-bold">{plan.price}</div>

                                    <div className="text-muted-foreground mt-1">{plan.period}</div>

                                    {plan.monthlyEquivalent && <div className="text-muted-foreground mt-2 text-sm">{plan.monthlyEquivalent}</div>}

                                    {plan.savings && (
                                        <div className="mt-3">
                                            <span className="rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                                                {plan.savings}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="text-muted-foreground rounded-lg border border-dashed p-2 text-center text-xs">
                                    Todos os módulos liberados desde o primeiro dia.
                                </div>
                                {plan.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="flex items-start gap-3">
                                        <Check className="text-primary mt-0.5 h-5 w-5 shrink-0" />

                                        <span className="text-sm leading-relaxed">{feature}</span>
                                    </div>
                                ))}
                            </CardContent>

                            <CardFooter className="flex flex-col gap-3 pt-6">
                                <Link href={route('register')} className="w-full">
                                    <Button size="lg" className="w-full">
                                        {plan.cta}
                                    </Button>
                                </Link>

                                <span className="text-muted-foreground text-xs">14 dias grátis • Cancele quando quiser</span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <p className="text-muted-foreground mt-12 text-center text-sm">
                    Teste gratuito por 14 dias • Sem cartão de crédito • Após o período de teste, o valor do plano escolhido poderá ser pago via Pix •
                    Cancelamento a qualquer momento
                </p>
            </div>
        </section>
    );
}
