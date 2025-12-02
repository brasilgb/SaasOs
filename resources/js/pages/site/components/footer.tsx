import { Wrench } from "lucide-react"

export function Footer() {
  return (
    <footer id="contato" className="border-t border-border bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded">
                <img src="images/logo.png" alt="TechOS" className="h-8 w-8" />
              </div>
              <span className="text-xl font-bold text-foreground">SigmaOs</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sistema de gestão de ordens de serviço para empresas de manutenção em informática, eletrônicos e eletrodomésticos.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Produto</h3>
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
                <a href="#contato" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          <div>
            {/* <h3 className="font-semibold text-foreground mb-4">Empresa</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sobre nós
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Casos de sucesso
                </a>
              </li>
              <li>
                <a href="#contato" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </a>
              </li>
            </ul> */}
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Suporte</h3>
            <ul className="space-y-3 text-sm">
              {/* <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Central de ajuda
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentação
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tutoriais
                </a>
              </li> */}
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 SigmaOS. Todos os direitos reservados.</p>
          {/* <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Termos
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </a>
          </div> */}
        </div>
      </div>
    </footer>
  )
}
