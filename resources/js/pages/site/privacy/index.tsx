import LegalLayout from '@/layouts/site/LegalLayout';
import { useActiveSection } from '@/Utils/use-active-section';
import { useState } from 'react';

const sections = [
    { id: 'coleta', title: '1. Informações que coletamos' },
    { id: 'uso', title: '2. Como utilizamos os dados' },
    { id: 'compartilhamento', title: '3. Compartilhamento de dados' },
    { id: 'seguranca', title: '4. Armazenamento e segurança' },
    { id: 'direitos', title: '5. Direitos do titular dos dados' },
    { id: 'retencao', title: '6. Retenção de dados' },
    { id: 'cookies', title: '7. Cookies' },
    { id: 'alteracoes', title: '8. Alterações nesta política' },
    { id: 'contato', title: '9. Contato' },
];

export default function Privacy() {
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

                <article className="text-muted-foreground max-w-[72ch] text-base leading-relaxed">
                    <h1 className="text-foreground mb-6 text-3xl font-semibold tracking-tight">Política de Privacidade – SigmaOS</h1>

                    <p className="text-muted-foreground mb-10 text-sm">Última atualização: 12 de março de 2026</p>

                    <p className="mb-6">
                        Esta Política de Privacidade descreve como o SigmaOS coleta, utiliza, armazena e protege os dados pessoais dos usuários que
                        utilizam nossa plataforma.
                    </p>

                    <p className="mb-10">
                        Estamos comprometidos com a transparência e com o cumprimento da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).
                    </p>

                    {/* COLETA */}

                    <h2 id="coleta" className="text-foreground border-border mt-14 mb-4 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        1. Informações que coletamos
                    </h2>

                    <p className="mb-4">Podemos coletar os seguintes tipos de dados:</p>

                    <h3 className="text-foreground mt-8 mb-2 text-sm font-semibold">Dados de cadastro</h3>

                    <ul className="mb-6 list-disc space-y-1 pl-6">
                        <li>Nome</li>
                        <li>Email</li>
                        <li>Telefone</li>
                        <li>Nome da empresa</li>
                    </ul>

                    <h3 className="text-foreground mt-8 mb-2 text-sm font-semibold">Dados de uso do sistema</h3>

                    <ul className="mb-6 list-disc space-y-1 pl-6">
                        <li>Informações inseridas na plataforma</li>
                        <li>Ordens de serviço cadastradas</li>
                        <li>Dados de clientes e equipamentos</li>
                        <li>Histórico de utilização</li>
                    </ul>

                    <h3 className="text-foreground mt-8 mb-2 text-sm font-semibold">Dados técnicos</h3>

                    <ul className="mb-10 list-disc space-y-1 pl-6">
                        <li>Endereço IP</li>
                        <li>Navegador utilizado</li>
                        <li>Sistema operacional</li>
                        <li>Data e hora de acesso</li>
                    </ul>

                    {/* USO */}

                    <h2 id="uso" className="text-foreground border-border mt-14 mb-4 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        2. Como utilizamos os dados
                    </h2>

                    <ul className="mb-10 list-disc space-y-1 pl-6">
                        <li>Criar e gerenciar contas de usuário</li>
                        <li>Permitir o funcionamento da plataforma</li>
                        <li>Melhorar nossos serviços</li>
                        <li>Prestar suporte técnico</li>
                        <li>Cumprir obrigações legais</li>
                        <li>Garantir a segurança da plataforma</li>
                    </ul>

                    {/* COMPARTILHAMENTO */}

                    <h2 id="compartilhamento" className="text-foreground border-border mt-14 mb-4 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        3. Compartilhamento de dados
                    </h2>

                    <p className="mb-4">O SigmaOS não vende dados pessoais.</p>

                    <ul className="mb-10 list-disc space-y-1 pl-6">
                        <li>Prestadores de serviço necessários para operação da plataforma</li>
                        <li>Cumprimento de obrigações legais</li>
                        <li>Determinação judicial ou autoridade competente</li>
                    </ul>

                    {/* SEGURANÇA */}

                    <h2 id="seguranca" className="text-foreground border-border mt-14 mb-4 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        4. Armazenamento e segurança
                    </h2>

                    <p className="mb-10">
                        Adotamos medidas técnicas e administrativas para proteger os dados contra acesso não autorizado, perda, alteração ou
                        divulgação indevida.
                    </p>

                    {/* DIREITOS */}

                    <h2 id="direitos" className="text-foreground border-border mt-14 mb-4 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        5. Direitos do titular dos dados
                    </h2>

                    <ul className="mb-10 list-disc space-y-1 pl-6">
                        <li>Acessar seus dados</li>
                        <li>Corrigir dados incompletos ou incorretos</li>
                        <li>Solicitar exclusão de dados</li>
                        <li>Solicitar portabilidade</li>
                        <li>Revogar consentimento</li>
                    </ul>

                    {/* RETENÇÃO */}

                    <h2 id="retencao" className="text-foreground border-border mt-14 mb-4 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        6. Retenção de dados
                    </h2>

                    <ul className="mb-10 list-disc space-y-1 pl-6">
                        <li>Prestação do serviço</li>
                        <li>Cumprimento de obrigações legais</li>
                        <li>Resolução de disputas</li>
                    </ul>

                    {/* COOKIES */}

                    <h2 id="cookies" className="text-foreground border-border mt-14 mb-4 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        7. Cookies
                    </h2>

                    <ul className="mb-10 list-disc space-y-1 pl-6">
                        <li>Melhorar a experiência do usuário</li>
                        <li>Lembrar preferências</li>
                        <li>Coletar dados estatísticos de uso</li>
                    </ul>

                    {/* ALTERAÇÕES */}

                    <h2 id="alteracoes" className="text-foreground border-border mt-14 mb-4 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        8. Alterações nesta política
                    </h2>

                    <p className="mb-10">Esta política pode ser atualizada periodicamente.</p>

                    {/* CONTATO */}

                    <h2 id="contato" className="text-foreground border-border mt-14 mb-4 scroll-mt-28 border-b pb-2 text-xl font-semibold">
                        9. Contato
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
