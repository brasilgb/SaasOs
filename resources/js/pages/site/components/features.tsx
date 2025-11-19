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
} from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "Cadastro completo com histórico de serviços, contatos e preferências de cada cliente.",
  },
  {
    icon: Calendar,
    title: "Agendamento de Visitas",
    description: "Agendamento de visitas técnicas para otimizar o tempo da equipe.",
  },
  {
    icon: ClipboardList,
    title: "Ordens de Serviço",
    description: "Controle total com status em tempo real, fotos do equipamento e histórico completo.",
  },
  {
    icon: FileSpreadsheet,
    title: "Pré-Orçamentos Prontos",
    description: "Gere orçamentos instantâneos com templates pré-configurados para equipamentos específicos. Economize tempo com valores e serviços já definidos.",
  },
  {
    icon: Package,
    title: "Controle de Estoque",
    description: "Gestão de peças e produtos com alertas de estoque mínimo e histórico de movimentações.",
  },
  {
    icon: ShoppingCart,
    title: "Vendas de Produtos/Peças",
    description: "Venda produtos e peças para clientes ou avulso, com emissão automática de recibos profissionais.",
  },
  {
    icon: MessageSquare,
    title: "Chat da Equipe",
    description: "Mensagens internas para comunicação rápida entre técnicos, atendentes e gestores.",
  },
  {
    icon: Smartphone,
    title: "App Android",
    description: "Aplicativo mobile para técnicos registrarem fotos e informações direto do campo.",
  },
  {
    icon: FileText,
    title: "Integração WhatsApp",
    description: "Envie mensagens pré-configuradas para clientes com atualizações de serviços.",
  },
  {
    icon: Printer,
    title: "Impressões Profissionais",
    description: "Recibos de entrada, orçamentos, entregas e etiquetas personalizadas para equipamentos.",
  },
  {
    icon: CheckSquare,
    title: "Checklist Comparativo",
    description: "Crie um checklist personalisado para equipamentos e compare na entrega com o cliente.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description: "Gere relatórios de visitas, ordens de serviço, clientes e vendas por período em PDF.",
  },
  {
    icon: Tag,
    title: "Etiquetas Inteligentes",
    description: "Imprima etiquetas para identificação rápida de equipamentos.",
  },
  {
    icon: BookOpen,
    title: "Manuais e Tutoriais em Vídeo",
    description: "Acesso completo a documentação detalhada e vídeos tutoriais para facilitar o uso de todas as funcionalidades.",
  },
  {
    icon: Settings,
    title: "Gestão de Usuários",
    description: "Controle de permissões para técnicos, atendentes e administradores.",
  },
]

export function Features() {
  return (
    <section id="recursos" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tudo que você precisa em um único sistema
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Recursos completos para empresas de manutenção em informática, eletrônicos e eletrodomésticos
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
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
