import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@inertiajs/react"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Mensal",
    price: "R$49,90",
    period: "por mês",
    description: "Ideal para começar",
    features: [
      "Todos os recursos incluídos",
      "Usuários ilimitados",
      "Aplicativo Android",
      "Suporte prioritário",
      "Atualizações automáticas",
      "Backup diário",
    ],
  },
  {
    name: "Trimestral",
    price: "R$132,30",
    period: "a cada 3 meses",
    description: "Economize pagando antecipado",
    features: [
      "Todos os recursos incluídos",
      "Usuários ilimitados",
      "Aplicativo Android",
      "Suporte prioritário",
      "Atualizações automáticas",
      "Backup diário",
      "10% de desconto",
    ],
  },
  {
    name: "Semestral",
    price: "R$246,96",
    period: "a cada 6 meses",
    description: "Melhor custo-benefício",
    popular: true,
    features: [
      "Todos os recursos incluídos",
      "Usuários ilimitados",
      "Aplicativo Android",
      "Suporte prioritário",
      "Atualizações automáticas",
      "Backup diário",
      "16% de desconto",
    ],
  },
]

export function Pricing() {
  return (
    <section id="precos" className="py-20 sm:py-32 bg-background">

      <div className="max-w-7xl mx-auto px-4">

        <div className="mx-auto max-w-2xl text-center mb-16">

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Preços simples e transparentes
          </h2>

          <p className="mt-4 text-lg text-muted-foreground">
            Teste gratuito por 30 dias. Sem cartão de crédito.
          </p>

        </div>

        <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">

          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                plan.popular ? "border-2 border-primary shadow-xl scale-105" : ""
              }`}
            >

              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                    Mais popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pt-8 pb-6">

                <CardTitle className="text-2xl">
                  {plan.name}
                </CardTitle>

                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>

                <div className="mt-6">

                  <div className="text-5xl font-bold">
                    {plan.price}
                  </div>

                  <div className="text-muted-foreground mt-1">
                    {plan.period}
                  </div>

                </div>

              </CardHeader>

              <CardContent className="space-y-4">

                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">

                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />

                    <span className="text-sm leading-relaxed">
                      {feature}
                    </span>

                  </div>
                ))}

              </CardContent>

              <CardFooter className="pt-6">

                <Link href={route("register")} className="w-full">

                  <Button size="lg" className="w-full">
                    Começar teste grátis
                  </Button>

                </Link>

              </CardFooter>

            </Card>
          ))}

        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          Teste gratuito por 30 dias. Sem compromisso.
        </p>

      </div>

    </section>
  )
}