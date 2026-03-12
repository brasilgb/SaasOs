import LegalLayout from "@/layouts/site/LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout>

      <h1 className="text-3xl font-bold mb-6">
        Política de Privacidade
      </h1>

      <p className="text-muted-foreground mb-6">
        Última atualização: 12 de março de 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none">

        <h2>Coleta de dados</h2>
        <p>
          Coletamos informações necessárias para o funcionamento da plataforma.
        </p>

        <h2>Uso das informações</h2>
        <p>
          Utilizamos os dados para fornecer e melhorar nossos serviços.
        </p>

        <h2>Segurança</h2>
        <p>
          Adotamos medidas técnicas para proteger os dados armazenados.
        </p>

      </div>

    </LegalLayout>
  )
}