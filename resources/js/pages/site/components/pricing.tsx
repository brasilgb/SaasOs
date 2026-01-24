import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@inertiajs/react"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Mensal",
    price: "R$ 49,00",
    period: "/mês",
    description: "Pagamento mensal com flexibilidade total",
    features: [
      "Todos os recursos incluídos",
      "App Android para upload de imagens",
      "Usuários ilimitados",
      "Suporte prioritário",
      "Atualizações automáticas",
      "Backup diário dos dados",
    ],
  },
  {
    name: "Trimestral",
    price: "R$ 132,30",
    period: "/trimestre",
    description: "Economize 10% no plano trimestral",
    popular: false,
    features: [
      "Todos os recursos incluídos",
      "App Android para upload de imagens",
      "Usuários ilimitados",
      "Suporte prioritário",
      "Atualizações automáticas",
      "Backup diário dos dados",
      "10% de desconto",
    ],
  },
  {
    name: "Semestral",
    price: "R$ 246,96",
    period: "/semestre",
    description: "Melhor custo-benefício com 16% de economia",
    features: [
      "Todos os recursos incluídos",
      "App Android para upload de imagens",
      "Usuários ilimitados",
      "Suporte prioritário",
      "Atualizações automáticas",
      "Backup diário dos dados",
      "16% de desconto",
    ],
  },
]

export function Pricing() {
  return (
    <section id="precos" className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Preços simples e transparentes
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Teste grátis por 07 dias. Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-border bg-card ${
                plan.popular ? "border-2 border-primary shadow-xl scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                    Mais Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl text-card-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground mt-2">{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-card-foreground leading-relaxed">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-6">
                <Link
                href={route('register')}
                >
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  size="lg"
                >
                  Começar teste grátis
                </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          Todos os planos incluem 07 dias de teste gratuito. Sem compromisso, cancele a qualquer momento.
        </p>
      </div>
    </section>
  )
}
