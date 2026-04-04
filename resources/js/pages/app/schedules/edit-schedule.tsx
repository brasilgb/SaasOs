import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar } from 'lucide-react';
import ScheduleForm from './schedule-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Agendamentos',
        href: route('app.schedules.index'),
    },
    {
        title: 'Editar',
        href: '#',
    },
];

export default function EditSchedule({ customers, schedule, technicals, page, search }: any) {
    return (
        <AppLayout>
            <Head title="Agendamentos" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Calendar} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Agendamentos</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div>
                    <Button variant={'default'} asChild>
                        <Link href={route('app.schedules.index', { page: page, search: search })}>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar</span>
                        </Link>
                    </Button>
                </div>
                <div></div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    <ScheduleForm customers={customers} initialData={schedule} technicals={technicals} />
                </div>
            </div>
        </AppLayout>
    );
}
