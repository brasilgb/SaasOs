import { type NavItem } from '@/types';
import {
    BanknoteArrowUpIcon,
    Building,
    Calendar,
    ClipboardList,
    Cog,
    CogIcon,
    Copyright,
    FileTextIcon,
    Mail,
    HandCoins,
    LayoutGrid,
    Link as linkmegb,
    MemoryStick,
    MessageCircleCode,
    MessageSquareMore,
    Monitor,
    PackagePlus,
    Printer,
    ShoppingCartIcon,
    ShieldAlert,
    Sparkles,
    Tags,
    UserCog,
    Users2,
    Wrench,
} from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
        icon: LayoutGrid,
        active: 'app.dashboard',
        enabled: 'dashboard',
        permission: 'dashboard',
    },
    {
        title: 'Acompanhamentos',
        href: route('app.follow-ups.index'),
        icon: Mail,
        active: 'app.follow-ups.index',
        enabled: 'orders',
        permission: 'orders',
    },
    {
        title: 'Tarefas',
        href: route('app.follow-ups.tasks'),
        icon: ClipboardList,
        active: 'app.follow-ups.tasks',
        enabled: 'orders',
        permission: 'orders',
    },
    {
        title: 'Perf. comercial',
        href: route('app.follow-ups.performance'),
        icon: Sparkles,
        active: 'app.follow-ups.performance',
        enabled: 'orders',
        permission: 'orders',
    },
    {
        title: 'Garantia/Avaliações',
        href: route('app.quality.index'),
        icon: ShieldAlert,
        active: 'app.quality.*',
        enabled: 'reports',
        permission: 'reports',
    },
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
        icon: PackagePlus,
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
    {
        title: 'Peças/Produtos',
        href: route('app.parts.index'),
        icon: MemoryStick,
        active: 'app.parts.*',
        enabled: 'parts',
        permission: 'parts',
    },
    {
        title: 'Vendas',
        href: route('app.sales.index'),
        icon: ShoppingCartIcon,
        active: 'app.sales.*',
        enabled: 'sales',
        permission: 'sales',
    },
    {
        title: 'Despesas',
        href: route('app.expenses.index'),
        icon: BanknoteArrowUpIcon,
        active: 'app.expenses.*',
        enabled: 'sales',
        permission: 'sales',
    },
    {
        title: 'Caixa diário',
        href: route('app.cashier.index'),
        icon: HandCoins,
        active: 'app.cashier.*',
        enabled: 'sales',
        permission: 'sales',
    },
    {
        title: 'Relatórios',
        href: route('app.reports.index'),
        icon: FileTextIcon,
        active: 'app.reports.*',
        enabled: 'reports',
        permission: 'reports',
    },
];

const mainUserItems: NavItem[] = [
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
                icon: Tags,
                active: 'app.label-printing.*',
                permission: 'label_printing',
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
                icon: ClipboardList,
                active: 'app.register-checklists.*',
                permission: 'register_checklists',
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

const mainPlansItems = [
    {
        title: 'Planos',
        url: '#',
        icon: HandCoins,
        items: [
            {
                title: 'Cadastrar plano',
                url: route('admin.plans.index'),
                icon: Copyright,
                active: 'admin.plans.*',
            },
            {
                title: 'Cadastrar períodos',
                url: route('admin.periods.index'),
                icon: Sparkles,
                active: 'admin.periods.*',
            },
            {
                title: 'Cadastrar característica',
                url: route('admin.features.index'),
                icon: Sparkles,
                active: 'admin.features.*',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'SIGMAOS',
        href: 'https://sigmaos.com.br',
        icon: linkmegb,
    },
];

export { footerNavItems, mainAdminItems, mainConfItems, mainNavItems, mainPlansItems, mainUserItems };
