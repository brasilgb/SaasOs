import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20 sm:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Pronto para transformar sua gestão?
          </h2>
          <p className="mt-6 text-pretty text-lg leading-relaxed opacity-90">
            Junte-se as empresas que já otimizaram seus processos com o SigmaOs. Comece seu teste
            gratuito hoje mesmo, sem compromisso.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2 text-base">
              <Link href={route('register')} className="flex items-center justify-center gap-2">
              Começar Teste Grátis Agora
              <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base bg-transparent">
              <a href="https://wa.me/5551995179173?text=Quero%20mais%20informações%20sobre%20SigmaOs" target="_blank" rel="noopener">
              Falar com Vendas
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
