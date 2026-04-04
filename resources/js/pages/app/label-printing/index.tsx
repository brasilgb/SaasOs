import AlertSuccess from '@/components/app-alert-success';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Cog, Printer } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Imprimir etiquetas',
        href: '#',
    },
];

export default function LabelPrinting({ labels }: any) {
    const { flash } = usePage().props as any;

    const { data, setData, processing, post } = useForm({
        initialorder: labels.id + 1,
        pages: 1,
        finalorder: labels.id + 96,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        post(route('app.label-printing.store'));
    };

    const handleLabelsTotals = () => {
        setData((data: any) => ({ ...data, initialorder: data?.initialorder }));
        setData((data: any) => ({ ...data, pages: data?.pages }));
        const labelTotal = (data?.initialorder - 1 + 96) * data.pages;
        setData((data: any) => ({ ...data, finalorder: labelTotal }));
    };

    return (
        <AppLayout>
            {flash.message && <AlertSuccess message={flash.message} />}
            <Head title="Impressão de etiquetas" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Cog} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Impressão de etiquetas</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div></div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    
                    <div className="mb-8">
                        <h2 className="text-sm">
                            As etiquetas são do modelo <strong className="text-red-600">A4048 (6x16)</strong> veja as configurações{' '}
                            <a
                                href="https://sig.ufla.br/modulos/ajuda/etiquetas.php?op=abrir&cod_etiqueta=12"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-sky-600 uppercase underline"
                            >
                                aqui
                            </a>
                            .
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8" method="post" target="_blank">
                        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                            <div className="grid gap-2">
                                <Label htmlFor="initialorder">Ordem inicial</Label>
                                <Input
                                    type="text"
                                    id="initialorder"
                                    value={data.initialorder}
                                    onChange={(e) => setData('initialorder', e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="pages">Número de páginas</Label>
                                <Input
                                    type="text"
                                    id="pages"
                                    value={data.pages}
                                    onChange={(e: any) => setData('pages', e.target.value)}
                                    onKeyUp={handleLabelsTotals}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="finalorder">Ordem final</Label>
                                <Input
                                    readOnly
                                    type="text"
                                    id="finalorder"
                                    value={data.finalorder}
                                    onChange={(e) => setData('finalorder', e.target.value)}
                                />
                            </div>

                            <div className="mt-5 grid gap-2">
                                <Button type="submit" disabled={processing}>
                                    <Printer />
                                    Imprimir
                                </Button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </AppLayout>
    );
}
