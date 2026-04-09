import { SidebarTrigger } from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { SharedData, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { MessageSquareMoreIcon } from 'lucide-react';
import BudgetsApproved from './budgets-aproved';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { UserMenuContent } from './user-menu-content';

type AppSidebarHeaderPageProps = SharedData & {
    notifications?: number;
    orderStatus?: unknown[];
    auth: SharedData['auth'] & {
        role?: string;
    };
};

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    void breadcrumbs;
    const page = usePage<AppSidebarHeaderPageProps>();
    const { auth, notifications = 0, orderStatus = [] } = page.props;

    const getInitials = useInitials();

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
            </div>
            <div className="flex items-center gap-2">
                {auth.user.tenant_id !== null && auth.role !== 'technician' && orderStatus.length > 0 ? <BudgetsApproved count={orderStatus.length} /> : ''}

                {auth.user.tenant_id !== null && (
                    <Button variant="ghost" size="icon" asChild className="relative">
                        <Link href={route('app.messages.index')}>
                            <Badge variant="default" className="absolute -top-2 -right-2">
                                {String(notifications)}
                            </Badge>
                            <MessageSquareMoreIcon />
                        </Link>
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-10 rounded-full p-1">
                            <Avatar className="size-8 overflow-hidden rounded-full">
                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
