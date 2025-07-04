import { type NavItem } from '@/types';
import { Link as linkmegb, Calendar, Cog, FilePlus2, Folder, LayoutGrid, MessageSquareMore, PackagePlus, User, UserCog, Users, Users2, Wrench, Building, MessageCircleCode, Printer, Tags, CogIcon, Copyright, Monitor, Sparkles, ClipboardList, Blocks } from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/',
        icon: LayoutGrid,
    },
    {
        title: 'Clientes',
        href: '/customers',
        icon: Users2,
        active: 'customers.*',
    },
    {
        title: 'Ordens de serviço',
        href: '/orders',
        icon: Wrench,
        active: 'orders.*',
    },
    {
        title: 'Agendamentos',
        href: '/schedules',
        icon: Calendar,
        active: 'schedules.*',
    },
    {
        title: 'Mensagens',
        href: '/messages',
        icon: MessageSquareMore,
        active: 'messages.*',
    },
];
const mainUserItems: NavItem[] = [
    {
        title: 'Usuários',
        href: '/users',
        icon: UserCog,
        active: 'users.*',
    },
];

const mainConfItems = [
    {
        title: "Configurações",
        url: "#",
        icon: Cog,
        items: [
            {
                title: 'Dados da empresa',
                url: '/company',
                icon: Building,
                active: 'company.*',
            },
            {
                title: 'Mensagens do Whatsapp',
                url: '/whatsapp-message',
                icon: MessageCircleCode,
                active: 'whatsapp-message.*',
            },
            {
                title: 'Impressões de recibos',
                url: '/receipts',
                icon: Printer,  
                active: 'receipts.*',
            },
            {
                title: 'Impressão de etiquetas',
                url: '/label-printing',
                icon: Tags, 
                active: 'label-printing.*',
            },
            {
                title: 'Tipo de equipamento',
                url: '/register-equipments',
                icon: Monitor,
                active: 'register-equipments.*',
            },
            {
                title: 'Checklist',
                url: '/register-checklists',
                icon: ClipboardList,
                active: 'register-checklists.*',
            },
            {
                title: 'Outras configurações',
                url: '/other-settings',
                icon: CogIcon,
                active: 'other-settings.*',
            },
        ]
    }
];

const mainRegisterItems = [
    {
        title: "Cadastros",
        url: "#",
        icon: PackagePlus,
        items: [
            {
                title: 'Cadastrar marcas',
                url: '/register-brands',
                icon: Copyright,
                active: 'register-brands.*',
            },
            {
                title: 'Cadastrar modelos',
                url: '/register-models',
                icon: Sparkles,
                active: 'register-models.*',
            },
            {
                title: 'Cadastrar serviços',
                url: '/register-services',
                icon: Wrench,
                active: 'register-services.*',
            },
            {
                title: 'Cadastrar orçamentos',
                url: '/register-budgets',
                icon: Blocks,
                active: 'register-budgets.*',
            },
        ]
    }
];

const footerNavItems: NavItem[] = [
    {
        title: 'MEGB',
        href: 'https://megb.com.br',
        icon: linkmegb,
    },
];

export { mainNavItems, mainUserItems ,mainConfItems, mainRegisterItems,footerNavItems};