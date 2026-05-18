import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ScrollText } from 'lucide-react';
import BudgetForm from './budget-form';

// Definição de tipo para as opções
interface OptionType {
    value: string;
    label: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel',
        href: route('app.dashboard'),
    },
    {
        title: 'Orçamentos',
        href: route('app.budgets.index'),
    },
    {
        title: 'Adicionar',
        href: route('app.budgets.create'),
    },
];

export default function EditBudget({ budgets, budget, equipments, page, search }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orçamentos" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={ScrollText} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Orçamentos</h2>
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div>
                    <Button variant={'default'} asChild>
                        <Link href={route('app.budgets.index', { page: page, search: search })}>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar</span>
                        </Link>
                    </Button>
                </div>
                <div></div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    <BudgetForm initialData={budget} budgets={budgets} equipments={equipments} />
                </div>
            </div>
        </AppLayout>
    );
}
