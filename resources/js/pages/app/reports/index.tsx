import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { FileTextIcon } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Vendas',
    href: '#',
  },
];

export default function Sales({ sales }: any) {

    return (
        <AppLayout>
            <Head title="Relatórios" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={FileTextIcon} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Vendas</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

        </AppLayout>
    )
}