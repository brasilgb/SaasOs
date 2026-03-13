import { useState } from "react";
import LegalLayout from "@/layouts/site/LegalLayout";
import { useActiveSection } from "@/Utils/use-active-section";

const sections = [
  { id: "descricao", title: "1. Descrição do serviço" },
  { id: "cadastro", title: "2. Cadastro de conta" },
  { id: "responsabilidade", title: "3. Responsabilidade do usuário" },
  { id: "disponibilidade", title: "4. Disponibilidade do serviço" },
  { id: "propriedade", title: "5. Propriedade intelectual" },
  { id: "cancelamento", title: "6. Cancelamento e suspensão" },
  { id: "responsabilidade-limitada", title: "7. Limitação de responsabilidade" },
  { id: "alteracoes", title: "8. Alterações nos termos" },
  { id: "legislacao", title: "9. Legislação aplicável" },
  { id: "contato", title: "10. Contato" },
];

export default function Terms() {

  const [open, setOpen] = useState(false);

  const activeSection = useActiveSection(
    sections.map((s) => s.id)
  );

  return (
    <LegalLayout>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12">

        {/* SIDEBAR */}

        <aside className="hidden lg:block">

          <nav className="sticky top-24 space-y-2 text-sm">

            <p className="font-semibold text-foreground mb-4">
              Índice
            </p>

            {sections.map((section) => (

              <a
                key={section.id}
                href={`#${section.id}`}
                className={`
                block border-l pl-3 py-1 transition-colors

                ${
                  activeSection === section.id
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }
                `}
              >
                {section.title}
              </a>

            ))}

          </nav>

        </aside>


        {/* CONTEÚDO */}

        <article className="max-w-[72ch] text-base leading-relaxed text-muted-foreground">

          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-6">
            Termos de Uso – SigmaOS
          </h1>

          <p className="text-sm text-muted-foreground mb-10">
            Última atualização: 12 de março de 2026
          </p>

          <p className="mb-10">
            Estes Termos de Uso regulam a utilização da plataforma SigmaOS.
            Ao utilizar o sistema, o usuário declara que leu, compreendeu
            e concorda com os presentes termos.
          </p>


          {/* DESCRIÇÃO */}

          <h2
            id="descricao"
            className="scroll-mt-28 text-xl font-semibold text-foreground mt-14 mb-4 border-b border-border pb-2"
          >
            1. Descrição do serviço
          </h2>

          <p className="mb-4">
            O SigmaOS é uma plataforma online de gestão de ordens de serviço
            destinada a empresas de manutenção e assistência técnica.
          </p>

          <p className="mb-3">
            A plataforma permite:
          </p>

          <ul className="list-disc pl-6 space-y-1 mb-10">
            <li>Cadastro de clientes</li>
            <li>Registro de equipamentos</li>
            <li>Gerenciamento de ordens de serviço</li>
            <li>Controle de peças e estoque</li>
            <li>Armazenamento de informações de atendimento</li>
          </ul>


          {/* CADASTRO */}

          <h2
            id="cadastro"
            className="scroll-mt-28 text-xl font-semibold text-foreground mt-14 mb-4 border-b border-border pb-2"
          >
            2. Cadastro de conta
          </h2>

          <p className="mb-4">
            Para utilizar o sistema, o usuário deve fornecer informações
            verdadeiras e atualizadas.
          </p>

          <p className="mb-3">
            O usuário é responsável por:
          </p>

          <ul className="list-disc pl-6 space-y-1 mb-10">
            <li>Manter a confidencialidade de suas credenciais</li>
            <li>Todas as atividades realizadas em sua conta</li>
          </ul>


          {/* RESPONSABILIDADE */}

          <h2
            id="responsabilidade"
            className="scroll-mt-28 text-xl font-semibold text-foreground mt-14 mb-4 border-b border-border pb-2"
          >
            3. Responsabilidade do usuário
          </h2>

          <p className="mb-3">
            O usuário concorda em não utilizar o sistema para:
          </p>

          <ul className="list-disc pl-6 space-y-1 mb-6">
            <li>Atividades ilegais</li>
            <li>Envio de conteúdo malicioso</li>
            <li>Tentativa de acesso não autorizado</li>
            <li>Violação de direitos de terceiros</li>
          </ul>

          <p className="mb-10">
            O usuário é responsável pelos dados cadastrados na plataforma.
          </p>


          {/* DISPONIBILIDADE */}

          <h2
            id="disponibilidade"
            className="scroll-mt-28 text-xl font-semibold text-foreground mt-14 mb-4 border-b border-border pb-2"
          >
            4. Disponibilidade do serviço
          </h2>

          <p className="mb-4">
            Nos esforçamos para manter o sistema disponível continuamente.
          </p>

          <p className="mb-3">
            Entretanto, o sistema pode ficar indisponível em casos de:
          </p>

          <ul className="list-disc pl-6 space-y-1 mb-10">
            <li>Manutenção técnica</li>
            <li>Falhas de infraestrutura</li>
            <li>Eventos fora de nosso controle</li>
          </ul>


          {/* PROPRIEDADE */}

          <h2
            id="propriedade"
            className="scroll-mt-28 text-xl font-semibold text-foreground mt-14 mb-4 border-b border-border pb-2"
          >
            5. Propriedade intelectual
          </h2>

          <p className="mb-10">
            Todo o conteúdo da plataforma, incluindo software,
            design, logotipo e funcionalidades, é propriedade
            do SigmaOS e protegido por leis de propriedade intelectual.
          </p>


          {/* CANCELAMENTO */}

          <h2
            id="cancelamento"
            className="scroll-mt-28 text-xl font-semibold text-foreground mt-14 mb-4 border-b border-border pb-2"
          >
            6. Cancelamento e suspensão
          </h2>

          <p className="mb-3">
            Reservamo-nos o direito de suspender ou cancelar contas que:
          </p>

          <ul className="list-disc pl-6 space-y-1 mb-10">
            <li>Violem estes termos</li>
            <li>Utilizem o sistema de forma abusiva</li>
            <li>Comprometam a segurança da plataforma</li>
          </ul>


          {/* RESPONSABILIDADE LIMITADA */}

          <h2
            id="responsabilidade-limitada"
            className="scroll-mt-28 text-xl font-semibold text-foreground mt-14 mb-4 border-b border-border pb-2"
          >
            7. Limitação de responsabilidade
          </h2>

          <ul className="list-disc pl-6 space-y-1 mb-10">
            <li>Perda de dados causada por uso indevido</li>
            <li>Danos indiretos decorrentes do uso da plataforma</li>
          </ul>


          {/* ALTERAÇÕES */}

          <h2
            id="alteracoes"
            className="scroll-mt-28 text-xl font-semibold text-foreground mt-14 mb-4 border-b border-border pb-2"
          >
            8. Alterações nos termos
          </h2>

          <p className="mb-10">
            Estes Termos de Uso podem ser modificados a qualquer momento.
            O uso contínuo da plataforma após alterações implica
            concordância com os novos termos.
          </p>


          {/* LEGISLAÇÃO */}

          <h2
            id="legislacao"
            className="scroll-mt-28 text-xl font-semibold text-foreground mt-14 mb-4 border-b border-border pb-2"
          >
            9. Legislação aplicável
          </h2>

          <p className="mb-10">
            Estes termos são regidos pelas leis da
            República Federativa do Brasil.
          </p>


          {/* CONTATO */}

          <h2
            id="contato"
            className="scroll-mt-28 text-xl font-semibold text-foreground mt-14 mb-4 border-b border-border pb-2"
          >
            10. Contato
          </h2>

          <p>
            Email:{" "}
            <a
              href="mailto:suporte@sigmaos.com.br"
              className="text-primary hover:underline"
            >
              suporte@sigmaos.com.br
            </a>
          </p>

        </article>

      </div>

    </LegalLayout>
  );
}