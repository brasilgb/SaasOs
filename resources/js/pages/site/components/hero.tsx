import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Link } from "@inertiajs/react"
import { ProductCarousel } from "./product-carousel"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 sm:py-32">

      <div className="max-w-7xl mx-auto px-4">

        <div className="mx-auto max-w-3xl text-center">

          <Badge variant="secondary" className="mb-6 text-sm">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent"></span>
            30 dias grátis • Sem cartão de crédito
          </Badge>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Controle sua assistência técnica
            <span className="block text-primary">
              sem planilhas e sem papel
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Gerencie clientes, ordens de serviço, estoque e equipe em um único sistema.
            Acesse do computador ou celular e organize sua empresa com facilidade.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">

            <Link href={route("register")}>
              <Button size="lg" className="text-base flex items-center gap-2">
                Começar Teste Grátis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>

          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">

            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <span>Sem instalação</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <span>App Android incluído</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <span>Suporte em português</span>
            </div>

          </div>

        </div>

        {/* Product Preview */}

        <div className="mt-16 mx-auto max-w-5xl">

          <div className="rounded-xl border bg-card p-2 shadow-xl">
            <ProductCarousel />
          </div>

        </div>

      </div>

    </section>
  )
}