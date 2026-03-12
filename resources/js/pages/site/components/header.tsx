import { Button } from "@/components/ui/button"
import { Head, Link, usePage } from "@inertiajs/react"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const { auth } = usePage().props as any

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleMenuToggle = () => setIsMenuOpen((prev) => !prev)

  const handleLinkClick = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
      <Head title="Início" />

      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="SigmaOS"
            className="h-8 w-8 object-contain"
          />
          <span className="text-xl font-bold">SigmaOS</span>
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#recursos"
            onClick={handleLinkClick}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Recursos
          </a>

          <a
            href="#precos"
            onClick={handleLinkClick}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Preços
          </a>

          <a
            href="#contato"
            onClick={handleLinkClick}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Contato
          </a>
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-4">

          {auth?.user ? (
            <Link
              href={route(`${auth?.user?.tenant_id === null ? 'admin.dashboard' : 'app.dashboard'}`)}
              className="hidden md:inline"
            >
              <Button variant="ghost">
                {auth.user.name}
              </Button>
            </Link>
          ) : (
            <>
              <Link
                href={route('login')}
                className="hidden md:inline text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Entrar
              </Link>

              <Link href={route('register')}>
                <Button>
                  Começar Grátis
                </Button>
              </Link>
            </>
          )}

          {/* Botão menu mobile */}
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

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="max-w-7xl mx-auto px-4 pb-4 md:hidden">

          <nav className="flex flex-col gap-4">
            <a
              href="#recursos"
              onClick={handleLinkClick}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Recursos
            </a>

            <a
              href="#precos"
              onClick={handleLinkClick}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Preços
            </a>

            <a
              href="#contato"
              onClick={handleLinkClick}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contato
            </a>
          </nav>

          <div className="border-t pt-4 flex flex-col gap-3">

            {auth?.user ? (
              <Link
                href={route(`${auth?.user?.tenant_id === null ? 'admin.dashboard' : 'app.dashboard'}`)}
                onClick={handleLinkClick}
              >
                <Button className="w-full">
                  {auth.user.name}
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  href={route('login')}
                  onClick={handleLinkClick}
                >
                  <Button variant="outline" className="w-full">
                    Entrar
                  </Button>
                </Link>

                <Link
                  href={route('register')}
                  onClick={handleLinkClick}
                >
                  <Button className="w-full">
                    Começar Grátis
                  </Button>
                </Link>
              </>
            )}

          </div>
        </div>
      )}
    </header>
  )
}