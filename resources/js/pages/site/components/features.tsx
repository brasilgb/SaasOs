import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart3,
    ChartLine,
    CheckCircle,
    ClipboardList,
    Eye,
    HandCoins,
    MessageSquare,
    Package,
    Printer,
    Settings,
    ShoppingCart,
    Smartphone,
    Users,
} from 'lucide-react';

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
        icon: HandCoins,
        title: 'Financeiro e Caixa',
        description: 'Acompanhe recebimentos, despesas, abertura e fechamento de caixa com conferência da rotina diária.',
    },
    {
        icon: MessageSquare,
        title: 'Comunicação Automática',
        description: 'Envie e-mails, WhatsApp e lembretes de pagamento para manter o cliente atualizado em cada etapa.',
    },
    {
        icon: ChartLine,
        title: 'Indicadores Comerciais',
        description: 'Acompanhe conversão de orçamentos, recuperação de cobrança e desempenho da operação.',
    },
    {
        icon: Smartphone,
        title: 'Aplicativo Android',
        description: 'Registre fotos e atualizações de serviço direto pelo celular.',
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
        description: 'Defina papéis e permissões para técnicos, atendentes e administradores.',
    },
];

export function Features() {
    return (
        <section id="recursos" className="relative overflow-hidden bg-[#07111f] py-20 text-white sm:py-32">
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f1b555]/12 blur-3xl" />
                <div className="absolute inset-0 bg-linear-to-b from-[#0d1c33] via-[#081223] to-[#060d18]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4">
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1 text-[0.7rem] font-semibold tracking-[0.26em] text-[#ffd6a3] uppercase">
                        Recursos essenciais
                    </span>

                    <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                        Plataforma de gestão operacional para atendimento técnico, financeiro, relacionamento com clientes e mais controle da rotina
                    </h2>

                    <p className="mt-4 text-lg leading-relaxed text-white/72">
                        Da entrada do equipamento ao fechamento do caixa, o SigmaOS reúne os módulos mais importantes da rotina em uma única plataforma.
                    </p>
                    <p className="mt-3 text-xs text-white/45">A emissão de notas fiscais é realizada por sistemas externos.</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="border-white/10 bg-white/[0.045] text-white shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#f1b555]/30 hover:bg-white/[0.07]"
                        >
                            <CardHeader>
                                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#f1b555]/20 bg-[#f1b555]/10 ring-1 ring-[#f1b555]/12">
                                    <feature.icon className="h-6 w-6 text-[#ffc980]" />
                                </div>

                                <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <CardDescription className="text-sm leading-relaxed text-white/68">{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
