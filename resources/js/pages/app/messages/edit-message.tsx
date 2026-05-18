import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MessageSquareMore } from 'lucide-react';
import MessageForm from './message-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel',
        href: route('app.dashboard'),
    },
    {
        title: 'Mensagens',
        href: route('app.messages.index'),
    },
    {
        title: 'Editar',
        href: '#',
    },
];

export default function EditMessage({ users, message, page, search }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mensagens" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={MessageSquareMore} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Mensagens</h2>
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div>
                    <Button variant={'default'} asChild>
                        <Link href={route('app.messages.index', { page: page, search: search })}>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar</span>
                        </Link>
                    </Button>
                </div>
                <div></div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    <MessageForm users={users} initialData={message} />
                </div>
            </div>
        </AppLayout>
    );
}
