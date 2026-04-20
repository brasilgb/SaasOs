import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart3,
    Calendar,
    ChartLine,
    CheckCircle,
    CheckSquare,
    ClipboardList,
    Eye,
    FileSpreadsheet,
    FileText,
    HandCoins,
    MessageSquare,
    Package,
    Printer,
    Settings,
    ShoppingCart,
    Smartphone,
    Tag,
    Users,
} from 'lucide-react';

const features = [
    {
        icon: Users,
        title: 'Gestão de Clientes',
        description: 'Centralize clientes, contatos, equipamentos e histórico de atendimento em um só lugar.',
    },
    {
        icon: MessageSquare,
        title: 'E-mails Automáticos',
        description: 'Envie e-mails automáticos com atualizações do atendimento, link de acompanhamento e lembretes operacionais.',
    },
    {
        icon: Calendar,
        title: 'Agendamento de Visitas',
        description: 'Organize visitas técnicas e evite conflitos de agenda da equipe.',
    },
    {
        icon: ClipboardList,
        title: 'Ordens de Serviço',
        description: 'Controle ordens com status, fotos, histórico e andamento completo.',
    },
    {
        icon: Eye,
        title: 'Acompanhamento da Ordem',
        description: 'Ofereça uma página exclusiva para o cliente acompanhar status, comprovantes, orçamento e próximos passos.',
    },
    {
        icon: CheckCircle,
        title: 'Aprovação de Orçamentos',
        description: 'Permita a aprovação ou reprovação de orçamentos com alerta automático no sistema.',
    },
    {
        icon: FileSpreadsheet,
        title: 'Pré-Orçamentos',
        description: 'Crie orçamentos em segundos com modelos prontos por equipamento.',
    },
    {
        icon: Package,
        title: 'Controle de Estoque',
        description: 'Gerencie peças e produtos com alertas de estoque mínimo.',
    },
    {
        icon: ShoppingCart,
        title: 'Vendas de Produtos',
        description: 'Venda produtos e peças direto no sistema com emissão automática de recibos.',
    },
    {
        icon: HandCoins,
        title: 'Controle de Despesas',
        description: 'Cadastre despesas e registre cada lançamento no caixa diário.',
    },
    {
        icon: MessageSquare,
        title: 'Lembretes de Pagamento',
        description: 'Envie lembretes manuais de pagamentos pendentes e mantenha a recuperação de cobrança sob controle.',
    },
    {
        icon: ChartLine,
        title: 'Performance Comercial',
        description: 'Acompanhe conversão de orçamento, recuperação de cobrança e resultado dos acompanhamentos.',
    },
    {
        icon: CheckSquare,
        title: 'Garantia e Avaliações',
        description: 'Monitore retorno em garantia, feedbacks críticos e ações de recuperação com a equipe.',
    },
    {
        icon: HandCoins,
        title: 'Caixa Diário',
        description: 'Faça abertura e fechamento de caixa com conferência de saldo e relatório em PDF.',
    },
    {
        icon: MessageSquare,
        title: 'Mensagens Internas',
        description: 'Envie mensagens internas por usuário com histórico para toda a equipe.',
    },
    {
        icon: Smartphone,
        title: 'Aplicativo Android',
        description: 'Registre fotos e atualizações de serviço direto pelo celular.',
    },
    {
        icon: FileText,
        title: 'Integração com WhatsApp',
        description: 'Automatize mensagens para clientes sobre o andamento do serviço.',
    },
    {
        icon: Printer,
        title: 'Impressão de Recibos',
        description: 'Imprima recibos, etiquetas e documentos sem sair do sistema.',
    },
    {
        icon: CheckSquare,
        title: 'Checklist de Equipamentos',
        description: 'Compare o estado do equipamento na entrada e na entrega.',
    },
    {
        icon: BarChart3,
        title: 'Relatórios Detalhados',
        description: 'Acompanhe desempenho, vendas e serviços com relatórios completos.',
    },
    {
        icon: ChartLine,
        title: 'Dashboard e KPIs',
        description: 'Visualize faturamento, ordens, clientes e desempenho em tempo real.',
    },
    {
        icon: Tag,
        title: 'Etiquetas Inteligentes',
        description: 'Identifique equipamentos rapidamente com etiquetas personalizadas.',
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

                    <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Uma plataforma completa para sua operação</h2>

                    <p className="mt-4 text-lg leading-relaxed text-white/72">
                        Ferramentas completas para organizar atendimento, equipe, financeiro, clientes e crescimento da operação em um único sistema.
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
