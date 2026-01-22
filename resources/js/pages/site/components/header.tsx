import { Button } from "@/components/ui/button"
import { Head, Link, usePage } from "@inertiajs/react"
import { Menu, Wrench, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const { auth } = usePage().props as any;

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Head title="Início" />
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="bg-white rounded">
            <img src="images/logo.png" alt="TechOS" className="h-8 w-8" />
          </div>
          <span className="text-xl font-bold text-foreground">SigmaOs</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#recursos"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Recursos
          </a>
          <a
            href="#precos"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Preços
          </a>
          <a
            href="#contato"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Contato
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden md:inline-flex">
            {auth?.user ? (
              <Link href={route(`${auth?.user?.tenant_id === null ? 'admin.dashboard' : 'app.dashboard'}`)}>{auth.user.name}</Link>
            ) : (
              <Link href={route('login')}>Entrar</Link>
            )}
          </Button>
          {!auth?.user &&
            <Button variant="default">
              <Link href={route('register')}>Começar Grátis</Link>
            </Button>
          }
          {/* botao menu mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={handleMenuToggle}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>


      {isMenuOpen && (
        <div className="container mx-auto px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <a
              href="#recursos"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Recursos
            </a>
            <a
              href="#precos"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Preços
            </a>
            <a
              href="#contato"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contato
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
