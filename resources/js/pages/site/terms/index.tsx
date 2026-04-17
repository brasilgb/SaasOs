import LegalLayout from '@/layouts/site/LegalLayout';
import { useActiveSection } from '@/Utils/use-active-section';
import { useState } from 'react';

const sections = [
    { id: 'descricao', title: '1. Descrição do serviço' },
    { id: 'cadastro', title: '2. Cadastro de conta' },
    { id: 'responsabilidade', title: '3. Responsabilidade do usuário' },
    { id: 'notas-fiscais', title: '4. Emissão de notas fiscais' },
    { id: 'disponibilidade', title: '5. Disponibilidade do serviço' },
    { id: 'propriedade', title: '6. Propriedade intelectual' },
    { id: 'cancelamento', title: '7. Cancelamento e suspensão' },
    { id: 'responsabilidade-limitada', title: '8. Limitação de responsabilidade' },
    { id: 'alteracoes', title: '9. Alterações nos termos' },
    { id: 'legislacao', title: '10. Legislação aplicável' },
    { id: 'contato', title: '11. Contato' },
];

export default function Terms() {
    const [open, setOpen] = useState(false);

    const activeSection = useActiveSection(sections.map((s) => s.id));

    return (
        <LegalLayout>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[240px_1fr]">
                {/* SIDEBAR */}

                <aside className="hidden lg:block">
                    <nav className="sticky top-24 space-y-2 text-sm">
                        <p className="text-foreground mb-4 font-semibold">Índice</p>

                        {sections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className={`block border-l py-1 pl-3 transition-colors ${
                                    activeSection === section.id
                                        ? 'border-primary text-foreground font-medium'
                                        : 'text-muted-foreground hover:text-foreground border-transparent'
                                } `}
                            >
                                {section.title}
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* CONTEÚDO */}

                <article className="text-muted-foreground max-w-[72ch] text-[15px] leading-7 [&>p]:mb-6 [&>ul]:mb-8 [&>ul]:space-y-2">
                    <h1 className="text-foreground mb-6 text-3xl font-semibold tracking-tight">Termos de Uso – SigmaOS</h1>

                    <p className="text-muted-foreground mb-10 text-sm">Última atualização: 12 de março de 2026</p>

                    <p>
                        Estes Termos de Uso regulam a utilização da plataforma SigmaOS. Ao utilizar o sistema, o usuário declara que leu, compreendeu
                        e concorda com os presentes termos.
                    </p>

                    {/* DESCRIÇÃO */}

                    <h2 id="descricao" className="text-foreground border-border mt-16 mb-5 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        1. Descrição do serviço
                    </h2>

                    <p>
                        O SigmaOS é uma plataforma online de gestão operacional destinada a empresas de assistência técnica, manutenção e serviços
                        recorrentes.
                    </p>

                    <p>A plataforma permite:</p>

                    <ul className="list-disc pl-6">
                        <li>Cadastro de clientes</li>
                        <li>Registro de equipamentos</li>
                        <li>Gerenciamento de ordens e atendimentos</li>
                        <li>Controle de peças e estoque</li>
                        <li>Armazenamento de informações de atendimento</li>
                        <li>Controle financeiro, caixa, despesas e vendas</li>
                        <li>Acompanhamento público do cliente, follow-ups e indicadores operacionais</li>
                    </ul>

                    {/* CADASTRO */}

                    <h2 id="cadastro" className="text-foreground border-border mt-16 mb-5 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        2. Cadastro de conta
                    </h2>

                    <p>Para utilizar o sistema, o usuário deve fornecer informações verdadeiras, completas e atualizadas.</p>

                    <p>O usuário é responsável por:</p>

                    <ul className="list-disc pl-6">
                        <li>Manter a confidencialidade de suas credenciais</li>
                        <li>Todas as atividades realizadas em sua conta</li>
                    </ul>

                    {/* RESPONSABILIDADE */}

                    <h2 id="responsabilidade" className="text-foreground border-border mt-16 mb-5 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        3. Responsabilidade do usuário
                    </h2>

                    <p>O usuário concorda em não utilizar o sistema para:</p>

                    <ul className="list-disc pl-6">
                        <li>Atividades ilegais</li>
                        <li>Envio de conteúdo malicioso</li>
                        <li>Tentativa de acesso não autorizado</li>
                        <li>Violação de direitos de terceiros</li>
                    </ul>

                    <p>
                        O usuário é responsável pela veracidade, legalidade e integridade dos dados inseridos na plataforma, incluindo informações de
                        clientes, equipamentos, ordens, vendas, despesas e registros operacionais.
                    </p>

                    {/* NOTAS FISCAIS */}

                    <h2 id="notas-fiscais" className="text-foreground border-border mt-16 mb-5 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        4. Emissão de notas fiscais
                    </h2>

                    <p>
                        O SigmaOS é uma plataforma de gestão operacional e não realiza a emissão direta de documentos fiscais como Nota Fiscal de
                        Serviço (NFS-e) ou Nota Fiscal Eletrônica (NF-e).
                    </p>

                    <p>
                        O sistema pode disponibilizar links ou integrações que direcionem o usuário para sistemas externos de emissão fiscal mantidos
                        por terceiros ou por órgãos governamentais.
                    </p>

                    <p>
                        A responsabilidade pela correta emissão de notas fiscais, cumprimento de obrigações tributárias e envio de informações aos
                        órgãos competentes é exclusivamente do usuário.
                    </p>

                    {/* DISPONIBILIDADE */}

                    <h2 id="disponibilidade" className="text-foreground border-border mt-16 mb-5 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        5. Disponibilidade do serviço
                    </h2>

                    <p>Nos esforçamos para manter o sistema disponível continuamente.</p>

                    <p>Entretanto, o serviço poderá ficar temporariamente indisponível em situações como:</p>

                    <ul className="list-disc pl-6">
                        <li>Manutenção técnica programada</li>
                        <li>Falhas de infraestrutura</li>
                        <li>Eventos fora de nosso controle</li>
                    </ul>

                    {/* PROPRIEDADE */}

                    <h2 id="propriedade" className="text-foreground border-border mt-16 mb-5 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        6. Propriedade intelectual
                    </h2>

                    <p>
                        Todo o conteúdo da plataforma, incluindo software, design, logotipo e funcionalidades, é propriedade do SigmaOS e protegido
                        por leis de propriedade intelectual.
                    </p>

                    {/* CANCELAMENTO */}

                    <h2 id="cancelamento" className="text-foreground border-border mt-16 mb-5 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        7. Cancelamento e suspensão
                    </h2>

                    <p>Reservamo-nos o direito de suspender ou cancelar contas que:</p>

                    <ul className="list-disc pl-6">
                        <li>Violem estes termos</li>
                        <li>Utilizem o sistema de forma abusiva</li>
                        <li>Comprometam a segurança da plataforma</li>
                    </ul>

                    {/* RESPONSABILIDADE LIMITADA */}

                    <h2
                        id="responsabilidade-limitada"
                        className="text-foreground border-border mt-16 mb-5 scroll-mt-28 border-b pb-2 text-xl font-semibold"
                    >
                        8. Limitação de responsabilidade
                    </h2>

                    <ul className="list-disc pl-6">
                        <li>Perda de dados causada por uso indevido da plataforma</li>
                        <li>Danos indiretos ou lucros cessantes decorrentes do uso do sistema</li>
                        <li>Falhas em serviços ou integrações de terceiros</li>
                    </ul>

                    {/* ALTERAÇÕES */}

                    <h2 id="alteracoes" className="text-foreground border-border mt-16 mb-5 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        9. Alterações nos termos
                    </h2>

                    <p>
                        Estes Termos de Uso podem ser modificados a qualquer momento. O uso contínuo da plataforma após alterações implica
                        concordância com os novos termos.
                    </p>

                    {/* LEGISLAÇÃO */}

                    <h2 id="legislacao" className="text-foreground border-border mt-16 mb-5 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        10. Legislação aplicável
                    </h2>

                    <p>Estes termos são regidos pelas leis da República Federativa do Brasil.</p>

                    {/* CONTATO */}

                    <h2 id="contato" className="text-foreground border-border mt-16 mb-5 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        11. Contato
                    </h2>

                    <p>
                        Email:{' '}
                        <a href="mailto:suporte@sigmaos.com.br" className="text-primary hover:underline">
                            suporte@sigmaos.com.br
                        </a>
                    </p>
                </article>
            </div>
        </LegalLayout>
    );
}
