import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart3,
    Bell,
    CalendarCheck,
    Camera,
    ChartLine,
    CheckCircle,
    ClipboardList,
    Eye,
    HandCoins,
    MessageSquare,
    Package,
    Printer,
    ReceiptText,
    Settings,
    ShoppingCart,
    Smartphone,
    Users,
    Wrench,
} from 'lucide-react';

const appFeatures = [
    {
        icon: Smartphone,
        title: 'App Autoatendimento',
        description: 'Cadastro rápido de clientes e consulta de orçamentos para agilizar recepção, balcão e atendimentos simples pelo celular.',
    },
    {
        icon: Wrench,
        title: 'App Técnico',
        description: 'Agenda em campo com check-in, check-out, checklist, relatório técnico, imagens e pagamento local.',
    },
    {
        icon: Camera,
        title: 'App Imagens',
        description: 'Upload de fotos da ordem direto pelo celular para documentar entrada, defeito, reparo e entrega.',
    },
];

const features = [
    {
        icon: ClipboardList,
        title: 'Ordens de Serviço',
        description: 'Controle entrada, diagnóstico, execução, status, fotos e histórico completo de cada atendimento.',
    },
    {
        icon: Users,
        title: 'Clientes e Equipamentos',
        description: 'Centralize clientes, contatos, equipamentos e histórico técnico em um só lugar.',
    },
    {
        icon: Eye,
        title: 'Acompanhamento da Ordem',
        description: 'Ofereça uma página exclusiva para o cliente acompanhar status, comprovantes, orçamento e próximos passos.',
    },
    {
        icon: CheckCircle,
        title: 'Orçamentos e Aprovação',
        description: 'Monte pré-orçamentos, envie para análise e receba aprovação ou reprovação com registro no sistema.',
    },
    {
        icon: Package,
        title: 'Estoque e Peças',
        description: 'Gerencie peças, produtos e movimentações com mais controle sobre disponibilidade e reposição.',
    },
    {
        icon: ShoppingCart,
        title: 'Vendas e Recibos',
        description: 'Registre vendas de produtos e peças no mesmo ambiente, com recibos e documentos prontos para impressão.',
    },
    {
        icon: ReceiptText,
        title: 'Notas Fiscais',
        description: 'Registre NF-e de produtos e NFS-e de serviços emitidas externamente e mantenha os comprovantes vinculados à operação.',
    },
    {
        icon: HandCoins,
        title: 'Financeiro e Caixa',
        description: 'Acompanhe recebimentos, despesas, abertura e fechamento de caixa com conferência da rotina diária.',
    },
    {
        icon: MessageSquare,
        title: 'Comunicação Automática',
        description: 'Envie e-mails, WhatsApp e lembretes de pagamento com mensagens claras para cada etapa da operação.',
    },
    {
        icon: Bell,
        title: 'Operação Simples e Produtiva',
        description:
            'Execute as tarefas diárias da sua empresa de manutenção com facilidade, desde o atendimento até a entrega, mantendo a equipe organizada e produtiva.',
    },
    {
        icon: CalendarCheck,
        title: 'Agenda Técnica em Campo',
        description: 'Envie atendimentos ao técnico, acompanhe status da visita e mantenha o histórico conectado à ordem de serviço.',
    },
    {
        icon: ChartLine,
        title: 'Indicadores Comerciais',
        description: 'Acompanhe conversão de orçamentos, recuperação de cobrança e desempenho da operação.',
    },
    {
        icon: Printer,
        title: 'Impressões Operacionais',
        description: 'Imprima recibos, etiquetas e documentos da operação sem depender de processos externos.',
    },
    {
        icon: BarChart3,
        title: 'Relatórios e Dashboard',
        description: 'Visualize faturamento, ordens, vendas e desempenho com relatórios e indicadores em tempo real.',
    },
    {
        icon: Settings,
        title: 'Gestão de Usuários',
        description: 'Defina papéis, permissões e liberação de técnico master para visualizar todas as ordens quando necessário.',
    },
];

export function Features() {
    return (
        <section id="recursos" className="relative overflow-hidden bg-white py-24 text-slate-900 sm:py-32">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <p className="text-sm font-bold text-blue-700">Recursos essenciais</p>

                    <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-balance text-slate-950 sm:text-5xl">
                        Plataforma web e apps móveis para atendimento técnico, financeiro, campo e relacionamento com clientes
                    </h2>

                    <p className="mt-5 text-lg leading-8 text-slate-600">
                        Da entrada do equipamento ao fechamento do caixa, o VetorOS reúne os módulos mais importantes da rotina em uma única
                        plataforma, com apps auxiliares para atendimento, imagens e equipe técnica.
                    </p>
                    <p className="mt-3 text-xs text-slate-400">
                        Os documentos fiscais são emitidos externamente e registrados no VetorOS para consulta e auditoria.
                    </p>
                </div>

                <div className="mb-12 grid gap-6 md:grid-cols-3">
                    {appFeatures.map((app) => (
                        <Card key={app.title} className="border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-900/10">
                            <CardHeader>
                                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
                                    <app.icon className="h-6 w-6 text-blue-300" />
                                </div>
                                <CardTitle className="text-lg text-white">{app.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm leading-6 text-slate-400">{app.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="flex h-full flex-col border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5"
                        >
                            <CardHeader>
                                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                    <feature.icon className="h-6 w-6 text-blue-700" />
                                </div>

                                <CardTitle className="flex min-h-12 items-start text-lg leading-6 text-slate-950">{feature.title}</CardTitle>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <CardDescription className="text-sm leading-6 text-slate-600">{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
