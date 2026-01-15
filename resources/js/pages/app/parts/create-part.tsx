import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, MemoryStick } from "lucide-react";
import PartForm from "./part-form";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Peças',
        href: route('app.parts.index'),
    },
    {
        title: 'Adicionar',
        href: '#',
    },
];

export default function CreatePart({ categories }: any) {

    return (
        <AppLayout>
            <Head title="Peças" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={MemoryStick} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Peças</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className='flex items-center justify-between p-4'>
                <div>
                    <Button variant={'default'} asChild>
                        <Link
                            href={route('app.parts.index')}
                        >
                            <ArrowLeft h-4 w-4 />
                            <span>Voltar</span>
                        </Link>
                    </Button>
                </div>
                <div>
                </div>
            </div>

            <div className='p-4'>
                <div className='border rounded-lg p-2'>

                    <PartForm categories={categories} />

                </div>
            </div>
        </AppLayout>
    )
}
