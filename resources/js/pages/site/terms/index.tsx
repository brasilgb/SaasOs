import LegalLayout from "@/layouts/site/LegalLayout";

export default function Terms() {
  return (
    <LegalLayout>

      <h1 className="text-3xl font-bold mb-6">
        Termos de Uso
      </h1>

      <p className="text-muted-foreground mb-6">
        Última atualização: 12 de março de 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none">

        <h2>Uso da plataforma</h2>
        <p>
          O SigmaOS é um sistema de gestão de ordens de serviço.
        </p>

        <h2>Responsabilidades do usuário</h2>
        <p>
          O usuário é responsável pelas informações cadastradas na plataforma.
        </p>

        <h2>Disponibilidade</h2>
        <p>
          Nos esforçamos para manter o sistema disponível continuamente.
        </p>

      </div>

    </LegalLayout>
  )
}