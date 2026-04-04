import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MemoryStick } from 'lucide-react';
import PartForm from './part-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Peças/Produtos',
        href: route('app.parts.index'),
    },
    {
        title: 'Adicionar',
        href: '#',
    },
];

export default function CreatePart({ categories, manufacturers }: any) {
    return (
        <AppLayout>
            <Head title="Peças" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={MemoryStick} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Peças/Produtos</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div>
                    <Button variant={'default'} asChild>
                        <Link href={route('app.parts.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar</span>
                        </Link>
                    </Button>
                </div>
                <div></div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    <PartForm categories={categories} manufacturers={manufacturers} />
                </div>
            </div>
        </AppLayout>
    );
}
