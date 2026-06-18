import { type NavGroup, type NavItem } from '@/types';
import {
    BanknoteArrowDownIcon,
    Barcode,
    BookOpenText,
    Building,
    Calendar,
    ClipboardCheck,
    ClipboardList,
    Cog,
    CogIcon,
    Copyright,
    FileChartColumn,
    FileTextIcon,
    LayoutGrid,
    Lightbulb,
    MessageCircle,
    MessageCircleCode,
    MessageSquareMore,
    Monitor,
    PackageCheck,
    Printer,
    ReceiptText,
    ScrollText,
    ShieldAlert,
    ShoppingCartIcon,
    Smartphone,
    UserCog,
    Users2,
    WalletCards,
    Wrench,
} from 'lucide-react';

const mainNavGroups: NavGroup[] = [
    {
        title: 'Geral',
        icon: LayoutGrid,
        items: [
            {
                title: 'Painel',
                href: route('app.dashboard'),
                icon: LayoutGrid,
                active: 'app.dashboard',
                enabled: 'dashboard',
                permission: 'dashboard',
            },
        ],
    },
    {
        title: 'Atendimento',
        icon: Wrench,
        items: [
            {
                title: 'Clientes',
                href: route('app.customers.index'),
                icon: Users2,
                active: 'app.customers.*',
                enabled: 'customers',
                permission: 'customers',
            },
            {
                title: 'Ordens de serviço',
                href: route('app.orders.index'),
                icon: Wrench,
                active: 'app.orders.*',
                enabled: 'orders',
                permission: 'orders',
            },
            {
                title: 'Orçamentos',
                href: route('app.budgets.index'),
                icon: ScrollText,
                active: 'app.budgets.*',
                enabled: 'budgets',
                permission: 'budgets',
            },
            {
                title: 'Agendamentos',
                href: route('app.schedules.index'),
                icon: Calendar,
                active: 'app.schedules.*',
                enabled: 'schedules',
                permission: 'schedules',
            },
            {
                title: 'Mensagens',
                href: route('app.messages.index'),
                icon: MessageSquareMore,
                active: 'app.messages.*',
                enabled: 'messages',
                permission: 'messages',
            },
        ],
    },
    {
        title: 'Estoque',
        icon: PackageCheck,
        items: [
            {
                title: 'Peças e produtos',
                href: route('app.parts.index'),
                icon: PackageCheck,
                active: 'app.parts.*',
                enabled: 'parts',
                permission: 'parts',
            },
        ],
    },
    {
        title: 'Relacionamento',
        icon: MessageCircle,
        items: [
            {
                title: 'Retornos ao cliente',
                href: route('app.follow-ups.index'),
                icon: MessageCircle,
                active: 'app.follow-ups.index',
                enabled: 'orders',
                permission: 'orders',
                visibilitySetting: 'show_follow_ups_menu',
            },
            {
                title: 'Central de pendências',
                href: route('app.follow-ups.tasks'),
                icon: ClipboardList,
                active: 'app.follow-ups.tasks',
                enabled: 'orders',
                permission: 'orders',
                visibilitySetting: 'show_tasks_menu',
            },
            {
                title: 'Resultados dos contatos',
                href: route('app.follow-ups.performance'),
                icon: FileChartColumn,
                active: 'app.follow-ups.performance',
                enabled: 'orders',
                permission: 'orders',
                visibilitySetting: 'show_commercial_performance_menu',
            },
            {
                title: 'Garantias e avaliações',
                href: route('app.quality.index'),
                icon: ShieldAlert,
                active: 'app.quality.*',
                enabled: 'reports',
                permission: 'reports',
                visibilitySetting: 'show_quality_menu',
            },
        ],
    },
    {
        title: 'Financeiro',
        icon: WalletCards,
        items: [
            {
                title: 'Caixa',
                href: route('app.cashier.index'),
                icon: WalletCards,
                active: 'app.cashier.*',
                enabled: 'finance',
                permission: 'finance',
            },
            {
                title: 'Despesas',
                href: route('app.expenses.index'),
                icon: BanknoteArrowDownIcon,
                active: 'app.expenses.*',
                enabled: 'finance',
                permission: 'finance',
            },
        ],
    },
    {
        title: 'Vendas / PDV',
        icon: ShoppingCartIcon,
        items: [
            {
                title: 'PDV e vendas',
                href: route('app.sales.index'),
                icon: ShoppingCartIcon,
                active: 'app.sales.*',
                enabled: 'sales',
                permission: 'sales',
            },
        ],
    },
    {
        title: 'Fiscal',
        icon: ReceiptText,
        items: [
            {
                title: 'Notas fiscais',
                href: route('app.fiscal-documents.index'),
                icon: ReceiptText,
                active: 'app.fiscal-documents.index',
                permission: 'fiscal_documents',
                fiscalSetting: 'enabled',
            },
        ],
    },
];

const mainNavItems: NavItem[] = mainNavGroups.flatMap((group) => group.items);

const mainUserItems: NavItem[] = [
    {
        title: 'Relatórios',
        href: route('app.reports.index'),
        icon: FileTextIcon,
        active: 'app.reports.*',
        enabled: 'reports',
        permission: 'reports',
    },
    {
        title: 'Usuários',
        href: route('app.users.index'),
        icon: UserCog,
        active: 'app.users.*',
        permission: 'users',
    },
];

const mainConfItems = [
    {
        title: 'Configurações',
        url: '#',
        icon: Cog,
        items: [
            {
                title: 'Dados da empresa',
                url: route('app.company.index'),
                icon: Building,
                active: 'app.company.*',
                permission: 'company',
            },
            {
                title: 'Mensagens do Whatsapp',
                url: route('app.whatsapp-message.index'),
                icon: MessageCircleCode,
                active: 'app.whatsapp-message.*',
                permission: 'whatsapp_messages',
            },
            {
                title: 'Impressões de recibos',
                url: route('app.receipts.index'),
                icon: Printer,
                active: 'app.receipts.*',
                permission: 'receipts',
            },
            {
                title: 'Impressão de etiquetas',
                url: route('app.label-printing.index'),
                icon: Barcode,
                active: 'app.label-printing.*',
                permission: 'label_printing',
            },
            {
                title: 'Configurações fiscais',
                url: route('app.fiscal-documents.settings'),
                icon: ReceiptText,
                active: 'app.fiscal-documents.settings',
                permission: 'fiscal_documents',
            },
            {
                title: 'Tipo de equipamento',
                url: route('app.register-equipments.index'),
                icon: Monitor,
                active: 'app.register-equipments.*',
                permission: 'register_equipments',
            },
            {
                title: 'Checklist',
                url: route('app.register-checklists.index'),
                icon: ClipboardCheck,
                active: 'app.register-checklists.*',
                permission: 'register_checklists',
            },
            {
                title: 'Ajustes/Avaliações',
                url: route('app.improvement-requests.index'),
                icon: MessageSquareMore,
                active: 'app.improvement-requests.*',
                permission: 'dashboard',
            },
            {
                title: 'Aplicativos auxiliares',
                url: route('app.auxiliary-apps.index'),
                icon: Smartphone,
                active: 'app.auxiliary-apps.*',
                permission: 'settings',
            },
            {
                title: 'Outras configurações',
                url: route('app.other-settings.index'),
                icon: CogIcon,
                active: 'app.other-settings.*',
                permission: 'other_settings',
            },
        ],
    },
];

const mainAdminItems = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
        icon: LayoutGrid,
        active: 'admin.dashboard',
    },
    {
        title: 'Empresas',
        href: route('admin.tenants.index'),
        icon: Building,
        active: 'admin.tenants.*',
    },
    {
        title: 'Notas SaaS',
        href: route('admin.fiscal-documents.index'),
        icon: ReceiptText,
        active: 'admin.fiscal-documents.*',
    },
    {
        title: 'Usuários',
        href: route('admin.users.index'),
        icon: UserCog,
        active: 'admin.users.*',
    },
    {
        title: 'Configurações',
        href: route('admin.settings.index'),
        icon: Cog,
        active: 'admin.settings.*',
    },
];

const mainAdminAdjustmentItems: NavItem[] = [
    {
        title: 'Avaliações',
        href: route('admin.tenant-feedbacks.index'),
        icon: MessageSquareMore,
        active: 'admin.tenant-feedbacks.*',
    },
    {
        title: 'Ajustes e solicitações',
        href: route('admin.tenant-improvement-requests.index'),
        icon: Lightbulb,
        active: 'admin.tenant-improvement-requests.*',
    },
];

const mainPlansItems: NavItem[] = [
    {
        title: 'Cadastrar plano',
        href: route('admin.plans.index'),
        icon: Copyright,
        active: 'admin.plans.*',
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentação',
        href: import.meta.env.VITE_APP_URL + '/documentation/doc-vetoros.html',
        icon: BookOpenText,
        external: true,
    },
    {
        title: 'Ajustes/Avaliações',
        href: route('app.improvement-requests.index'),
        icon: MessageSquareMore,
        active: 'app.improvement-requests.*',
        permission: 'dashboard',
    },
];

export { footerNavItems, mainAdminAdjustmentItems, mainAdminItems, mainConfItems, mainNavGroups, mainNavItems, mainPlansItems, mainUserItems };
