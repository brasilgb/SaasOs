import { Link } from "@inertiajs/react"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="SigmaOS" className="h-8 w-8" />
            <span className="font-semibold text-lg">
              SigmaOS
            </span>
          </Link>

        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1">

        <div className="max-w-3xl mx-auto px-4 py-12">
          {children}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-border">

        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between text-sm text-muted-foreground">

          <p>
            © {new Date().getFullYear()} SigmaOS
          </p>

          <div className="flex gap-6">

            <Link href="/privacidade">
              Privacidade
            </Link>

            <Link href="/termos">
              Termos
            </Link>

          </div>

        </div>

      </footer>

    </div>
  )
}