import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { Cog, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AlertSuccess from "@/components/app-alert-success";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Impressões de recibos',
        href: '#',
    },
];

export default function Receipts({ receipt }: any) {
    const { flash } = usePage().props as any;

    const { data, setData, patch, progress, processing, errors } = useForm({
        receivingequipment: receipt?.receivingequipment,
        equipmentdelivery: receipt?.equipmentdelivery,
        budgetissuance: receipt?.budgetissuance,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        patch(route('app.receipts.update', receipt?.id));
    }

    return (
        <AppLayout>
            {flash.message && <AlertSuccess message={flash.message} />}
            <Head title="Impressão de recibos" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={Cog} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Impressão de recibos</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className='flex items-center justify-between p-4'>
                <div>
                </div>
            </div>

            <div className='p-4'>
                <div className='border rounded-lg p-2'>

                    <form onSubmit={handleSubmit} autoComplete="off"className="space-y-8">
                        <div className="grid gap-4 mt-4">

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="receivingequipment">Recebimento de equipamentos</Label>
                                <Textarea
                                    id="receivingequipment"
                                    value={data.receivingequipment}
                                    onChange={(e) => setData('receivingequipment', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="equipmentdelivery">Entrega de equipamento</Label>
                                <Textarea
                                    id="equipmentdelivery"
                                    value={data.equipmentdelivery}
                                    onChange={(e) => setData('equipmentdelivery', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="budgetissuance">Emissão de orçamento</Label>
                                <Textarea
                                    id="budgetissuance"
                                    value={data.budgetissuance}
                                    onChange={(e) => setData('budgetissuance', e.target.value)}
                                />
                            </div>

                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save />
                                Salvar
                            </Button>
                        </div>
                    </form>

                </div>
            </div>
        </AppLayout>
    )
}