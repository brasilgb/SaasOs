import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { FileTextIcon, LogOut } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const roleLabelByValue: Record<number, string> = {
        99: 'RootSystem',
        9: 'RootApp',
        1: 'Administrador',
        2: 'Operador/Atendente',
        3: 'Técnico',
    };
    const userRoleLabel = roleLabelByValue[Number(user?.roles)] ?? 'Usuário';

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <a href={import.meta.env.VITE_APP_URL + '/documentation/doc-sigmaos.html'} target="_blank" rel="noopener noreferrer">
                        <FileTextIcon className="mr-2" />
                        <span>Documentação</span>
                    </a>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                    <LogOut className="mr-2" />
                    Sair do sistema
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground px-2 py-1 text-xs font-normal text-center">Função: {userRoleLabel}</DropdownMenuLabel>
        </>
    );
}
