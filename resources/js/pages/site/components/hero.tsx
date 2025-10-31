import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Link } from "@inertiajs/react"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 text-sm">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent"></span>
            30 dias grátis • Sem cartão de crédito
          </Badge>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Gestão completa para sua empresa de manutenção
          </h1>

          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Sistema profissional para gerenciar clientes, ordens de serviço, estoque, agendamentos e equipe. Tudo em um
            só lugar, com app mobile e integração WhatsApp.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className=" text-base">
              <Link href={route('register')} className="flex items-center justify-center gap-2">
                Começar Teste Grátis
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
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

        <div className="mt-16 mx-auto max-w-5xl">
          <div className="rounded-xl border border-border bg-card p-2 shadow-2xl">
            <img
              src="./images/placeholder.svg?height=600&width=1200"
              alt="Dashboard do sistema"
              className="rounded-lg w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
