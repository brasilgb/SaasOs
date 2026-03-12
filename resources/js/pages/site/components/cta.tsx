import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { ArrowRight, MessageCircle } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20 sm:py-32 bg-linear-to-b from-primary/90 to-primary/70 text-primary-foreground">

      <div className="max-w-6xl mx-auto px-4">

        <div className="mx-auto max-w-3xl text-center">

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pronto para transformar sua gestão?
          </h2>

          <p className="mt-6 text-lg leading-relaxed opacity-90">
            Simplifique suas ordens de serviço, controle de peças e atendimento ao cliente.
            Teste o SigmaOs gratuitamente por 30 dias.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">

            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href={route("register")}>
                Começar teste grátis
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-base"
              asChild
            >
              <a
                href="https://wa.me/5551995179173?text=Quero%20mais%20informações%20sobre%20SigmaOs"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
                Falar no WhatsApp
              </a>
            </Button>

          </div>

        </div>

      </div>

    </section>
  )
}