import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MessageSquareMore } from 'lucide-react';
import MessageForm from './message-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Mensagens',
        href: route('app.messages.index'),
    },
    {
        title: 'Adicionar',
        href: route('app.messages.create'),
    },
];

export default function CreateMessage({ users }: any) {
    return (
        <AppLayout>
            <Head title="Mensagens" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={MessageSquareMore} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Mensagens</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div>
                    <Button variant={'default'} asChild>
                        <Link href={route('app.messages.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar</span>
                        </Link>
                    </Button>
                </div>
                <div></div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    <MessageForm users={users} />
                </div>
            </div>
        </AppLayout>
    );
}
