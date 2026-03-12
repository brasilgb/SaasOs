import { MessageCircle } from "lucide-react"
import { Link } from "@inertiajs/react"

export function Footer() {
  return (
    <footer id="contato" className="border-t border-border bg-muted/30 py-16">

      <div className="max-w-7xl mx-auto px-4">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Logo + descrição */}
          <div className="space-y-4">

            <div className="flex items-center gap-2">
              <div className="bg-white rounded p-1">
                <img src="/images/logo.png" alt="SigmaOS" className="h-7 w-7" />
              </div>
              <span className="text-xl font-bold">
                SigmaOs
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Sistema de gestão de ordens de serviço para empresas de manutenção
              em informática, eletrônicos e eletrodomésticos.
            </p>

          </div>

          {/* Produto */}
          <div>

            <h3 className="font-semibold mb-4">
              Produto
            </h3>

            <ul className="space-y-3 text-sm">

              <li>
                <a href="#recursos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Recursos
                </a>
              </li>

              <li>
                <a href="#precos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Preços
                </a>
              </li>

              <li>
                <Link href={route("login")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Entrar
                </Link>
              </li>

            </ul>

          </div>

          {/* Empresa */}
          <div>

            <h3 className="font-semibold mb-4">
              Empresa
            </h3>

            <ul className="space-y-3 text-sm">

              <li>
                <a href="#contato" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </a>
              </li>

              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Termos de uso
                </a>
              </li>

              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Política de privacidade
                </a>
              </li>

            </ul>

          </div>

          {/* Suporte */}
          <div>

            <h3 className="font-semibold mb-4">
              Suporte
            </h3>

            <ul className="space-y-3 text-sm">

              <li>
                <a
                  href="https://wa.me/5551995179173?text=Quero%20mais%20informações%20sobre%20SigmaOs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>

              <li>
                <a
                  href="mailto:suporte@sigmaos.com.br"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  suporte@sigmaos.com.br
                </a>
              </li>

            </ul>

          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SigmaOs. Todos os direitos reservados.
          </p>

          <div className="flex gap-6 text-sm">

            <a href="/privacidade" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacidade
            </a>

            <a href="/termos" className="text-muted-foreground hover:text-foreground transition-colors">
              Termos
            </a>

          </div>

        </div>

      </div>

    </footer>
  )
}