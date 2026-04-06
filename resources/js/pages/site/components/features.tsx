import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart3,
    BookOpen,
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
        description: 'Centralize histórico de serviços, contatos e equipamentos em um único lugar.',
    },
    {
        icon: MessageSquare,
        title: 'Notificações por E-mail',
        description:
            'Dispare e-mails automáticos para o cliente ao cadastrar a ordem de serviço e sempre que houver atualização de status, com link de acompanhamento.',
    },
    {
        icon: Calendar,
        title: 'Agendamento de Visitas',
        description: 'Organize visitas técnicas e evite conflitos de agenda da equipe.',
    },
    {
        icon: ClipboardList,
        title: 'Ordens de Serviço',
        description: 'Controle completo de ordens com status, fotos e histórico detalhado.',
    },
    {
        icon: Eye,
        title: 'Acompanhamento da Ordem de Serviço',
        description: 'Envie um link para que o cliente acompanhe o status da ordem de serviço em uma página exclusiva.',
    },
    {
        icon: CheckCircle,
        title: 'Aprovar ou reprovar orçamentos',
        description: 'O cliente pode aprovar ou reprovar o orçamento gerado e sua página exclusiva, e um alerta será exibido no sistema.',
    },
    {
        icon: FileSpreadsheet,
        title: 'Pré-Orçamentos Prontos',
        description: 'Crie orçamentos em segundos com templates configurados por equipamento.',
    },
    {
        icon: Package,
        title: 'Controle de Estoque',
        description: 'Gerencie peças e produtos com alertas de estoque mínimo.',
    },
    {
        icon: ShoppingCart,
        title: 'Vendas de Produtos e Peças',
        description: 'Venda itens diretamente pelo sistema com emissão automática de recibos.',
    },
    {
        icon: HandCoins,
        title: 'Caixa Diário',
        description: 'Realize abertura e fechamento diário de caixa com conferência de saldo, diferença e relatório em PDF.',
    },
    {
        icon: MessageSquare,
        title: 'Mensagens por Usuário',
        description: 'Envie mensagens internas direcionadas por usuário, com histórico para técnicos, atendentes e administradores.',
    },
    {
        icon: Smartphone,
        title: 'Aplicativo Android',
        description: 'Registre fotos e atualizações de serviço diretamente pelo celular.',
    },
    {
        icon: FileText,
        title: 'Integração com WhatsApp',
        description: 'Envie mensagens automáticas para clientes sobre o status do serviço.',
    },
    {
        icon: Printer,
        title: 'Impressão de Recibos',
        description: 'Imprima recibos, etiquetas e documentos diretamente pelo sistema.',
    },
    {
        icon: CheckSquare,
        title: 'Checklist de Equipamentos',
        description: 'Compare o estado do equipamento na entrada e na entrega.',
    },
    {
        icon: BarChart3,
        title: 'Relatórios Detalhados',
        description: 'Analise desempenho, vendas e serviços com relatórios completos.',
    },
    {
        icon: ChartLine,
        title: 'Dashboard com KPIs e Gráficos',
        description: 'Visualize faturamento, ordens de serviço, clientes e desempenho do negócio em gráficos claros e indicadores em tempo real.',
    },
    {
        icon: Tag,
        title: 'Etiquetas Inteligentes',
        description: 'Identifique equipamentos rapidamente com etiquetas personalizadas.',
    },
    {
        icon: BookOpen,
        title: 'Treinamento em Vídeo',
        description: 'Acesse tutoriais completos para aprender a usar todas as funções.',
    },
    {
        icon: Settings,
        title: 'Gestão de Usuários',
        description: 'Definição de papéis predefinidos pelo sistema para técnicos, atendentes e administradores.',
    },
];

export function Features() {
    return (
        <section id="recursos" className="bg-muted/30 py-20 sm:py-32">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tudo que sua assistência técnica precisa</h2>

                    <p className="text-muted-foreground mt-4 text-lg">
                        Ferramentas completas para organizar clientes, serviços, estoque e equipe em um único sistema.
                    </p>
                    <p className="text-muted-foreground mt-3 text-xs">A emissão de notas fiscais é realizada por sistemas externos.</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <CardHeader>
                                <div className="bg-primary/10 ring-primary/20 mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg ring-1">
                                    <feature.icon className="text-primary h-6 w-6" />
                                </div>

                                <CardTitle className="text-lg">{feature.title}</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
