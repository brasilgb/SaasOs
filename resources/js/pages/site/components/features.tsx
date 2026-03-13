import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Calendar,
  MessageSquare,
  ClipboardList,
  Package,
  Printer,
  Smartphone,
  Settings,
  FileText,
  Tag,
  CheckSquare,
  BarChart3,
  FileSpreadsheet,
  ShoppingCart,
  BookOpen,
  Eye,
  ChartLine,
} from "lucide-react"
import { LineChart } from "recharts"

const features = [
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "Centralize histórico de serviços, contatos e equipamentos em um único lugar.",
  },
  {
    icon: Calendar,
    title: "Agendamento de Visitas",
    description: "Organize visitas técnicas e evite conflitos de agenda da equipe.",
  },
  {
    icon: ClipboardList,
    title: "Ordens de Serviço",
    description: "Controle completo de ordens com status, fotos e histórico detalhado.",
  },
  {
    icon: Eye,
    title: "Acompanhamento da Ordem de Serviço",
    description:
      "Envie um link para que o cliente acompanhe o status da ordem de serviço em uma página exclusiva.",
  },
  {
    icon: FileSpreadsheet,
    title: "Pré-Orçamentos Prontos",
    description: "Crie orçamentos em segundos com templates configurados por equipamento.",
  },
  {
    icon: Package,
    title: "Controle de Estoque",
    description: "Gerencie peças e produtos com alertas de estoque mínimo.",
  },
  {
    icon: ShoppingCart,
    title: "Vendas de Produtos e Peças",
    description: "Venda itens diretamente pelo sistema com emissão automática de recibos.",
  },
  {
    icon: MessageSquare,
    title: "Comunicação Interna",
    description: "Troque mensagens entre técnicos e atendentes sem sair do sistema.",
  },
  {
    icon: Smartphone,
    title: "Aplicativo Android",
    description: "Registre fotos e atualizações de serviço diretamente pelo celular.",
  },
  {
    icon: FileText,
    title: "Integração com WhatsApp",
    description: "Envie mensagens automáticas para clientes sobre o status do serviço.",
  },
  {
    icon: Printer,
    title: "Impressão de Recibos",
    description: "Imprima recibos, etiquetas e documentos diretamente pelo sistema.",
  },
  {
    icon: CheckSquare,
    title: "Checklist de Equipamentos",
    description: "Compare o estado do equipamento na entrada e na entrega.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description: "Analise desempenho, vendas e serviços com relatórios completos.",
  },
  {
    icon: ChartLine,
    title: "Dashboard com KPIs e Gráficos",
    description:
      "Visualize faturamento, ordens de serviço, clientes e desempenho do negócio em gráficos claros e indicadores em tempo real.",
  },
  {
    icon: Tag,
    title: "Etiquetas Inteligentes",
    description: "Identifique equipamentos rapidamente com etiquetas personalizadas.",
  },
  {
    icon: BookOpen,
    title: "Treinamento em Vídeo",
    description: "Acesse tutoriais completos para aprender a usar todas as funções.",
  },
  {
    icon: Settings,
    title: "Gestão de Usuários",
    description: "Controle permissões para técnicos, atendentes e administradores.",
  },
]

export function Features() {
  return (
    <section id="recursos" className="py-20 sm:py-32 bg-muted/30">

      <div className="max-w-7xl mx-auto px-4">

        <div className="mx-auto max-w-2xl text-center mb-16">

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo que sua assistência técnica precisa
          </h2>

          <p className="mt-4 text-lg text-muted-foreground">
            Ferramentas completas para organizar clientes, serviços, estoque e equipe em um único sistema.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            A emissão de notas fiscais é realizada por sistemas externos.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >

              <CardHeader>

                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>

                <CardTitle className="text-lg">
                  {feature.title}
                </CardTitle>

              </CardHeader>

              <CardContent>

                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>

              </CardContent>

            </Card>
          ))}

        </div>

      </div>

    </section>
  )
}