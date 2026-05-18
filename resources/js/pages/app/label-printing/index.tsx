import AlertSuccess from '@/components/app-alert-success';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Barcode, Printer } from 'lucide-react';
import { useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel',
        href: route('app.dashboard'),
    },
    {
        title: 'Imprimir etiquetas',
        href: '#',
    },
];

export default function LabelPrinting({ nextOrderNumber, labelSettings }: any) {
    const { flash } = usePage().props as any;

    const { data, setData } = useForm({
        initialorder: nextOrderNumber ?? 1,
        pages: 1,
    });

    const computedFinalOrder = useMemo(() => {
        const initial = Number(data.initialorder) || 1;
        const pages = Math.max(1, Number(data.pages) || 1);

        return initial + pages * 96 - 1;
    }, [data.initialorder, data.pages]);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const params = new URLSearchParams({
            initialorder: String(data.initialorder),
            pages: String(data.pages),
        });

        window.open(`${route('app.label-printing.print')}?${params.toString()}`, '_blank', 'noopener,noreferrer');
    };

    const handleThermalTestPrint = () => {
        const params = new URLSearchParams({
            initialorder: String(data.initialorder),
            quantity: '1',
            format: 'thermal',
        });

        window.open(`${route('app.label-printing.print')}?${params.toString()}`, '_blank', 'noopener,noreferrer');
    };

    const handleTogglePrintButton = (checked: boolean) => {
        router.put(
            route('app.label-printing.settings'),
            {
                print_label_button_after_order_create: checked,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {flash.message && <AlertSuccess message={flash.message} />}
            <Head title="Impressão de etiquetas" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Barcode} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Impressão de etiquetas</h2>
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div></div>
            </div>

            <div className="p-4">
                <div className="space-y-6">
                    <div className="bg-card overflow-hidden rounded-xl border">
                        <div className="bg-muted/40 border-b px-6 py-5">
                            <h2 className="text-foreground text-base font-semibold">Imprimir etiquetas em A4</h2>
                            <p className="text-muted-foreground mt-1 text-sm">
                                As etiquetas usam o modelo <strong className="text-foreground">A4048 (6x16)</strong>. Consulte as configurações de
                                papel{' '}
                                <a
                                    href="https://sig.ufla.br/modulos/ajuda/etiquetas.php?op=abrir&cod_etiqueta=12"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-sky-600 underline underline-offset-4"
                                >
                                    neste guia
                                </a>
                                .
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6 px-6 py-6">
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="initialorder">Ordem inicial</Label>
                                    <Input
                                        type="number"
                                        id="initialorder"
                                        value={data.initialorder}
                                        onChange={(e) => setData('initialorder', e.target.value)}
                                        min={1}
                                    />
                                    <p className="text-muted-foreground text-xs">Sugestão automática pela próxima order_number do tenant.</p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="pages">Número de páginas</Label>
                                    <Input
                                        type="number"
                                        id="pages"
                                        value={data.pages}
                                        onChange={(e: any) => setData('pages', e.target.value)}
                                        min={1}
                                    />
                                    <p className="text-muted-foreground text-xs">Cada página gera 96 etiquetas.</p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="finalorder">Ordem final</Label>
                                    <Input readOnly type="number" id="finalorder" value={computedFinalOrder} className="bg-muted/50" />
                                    <p className="text-muted-foreground text-xs">Faixa total que será enviada para impressão.</p>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" className="w-full md:w-auto">
                                    <Printer />
                                    Imprimir etiquetas
                                </Button>
                            </div>

                            <div className="bg-muted/30 text-muted-foreground grid gap-3 rounded-lg border p-4 text-sm md:grid-cols-3">
                                <div>
                                    <span className="text-foreground font-medium">Modelo:</span> A4048
                                </div>
                                <div>
                                    <span className="text-foreground font-medium">Layout:</span> 6 colunas x 16 linhas
                                </div>
                                <div>
                                    <span className="text-foreground font-medium">Total:</span> {Math.max(1, Number(data.pages) || 1) * 96} etiquetas
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="bg-card overflow-hidden rounded-xl border">
                        <div className="bg-muted/40 border-b px-6 py-5">
                            <h2 className="text-foreground text-base font-semibold">Habilitar impressão em etiquetadeira</h2>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Use etiquetadeira com etiqueta <strong className="text-foreground">60 x 40 mm</strong>. Um botão imprimir etiqueta ira
                                aparecer no cadastro de ordens de serviço.
                            </p>
                        </div>

                        <div className="px-6 py-6">
                            <div className="bg-muted/25 space-y-4 rounded-lg border p-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="space-y-1">
                                        <p className="text-foreground text-sm font-medium">Ativar botão de impressão rápida</p>
                                        <p className="text-muted-foreground text-sm">
                                            Quando habilitado, o cadastro da ordem exibirá um botão para imprimir etiqueta.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            id="print_label_button_after_order_create"
                                            checked={Boolean(labelSettings?.print_label_button_after_order_create)}
                                            onCheckedChange={handleTogglePrintButton}
                                        />
                                        <span className="text-muted-foreground text-sm">
                                            {labelSettings?.print_label_button_after_order_create ? 'Habilitado' : 'Desabilitado'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                                    <div className="space-y-1">
                                        <p className="text-foreground text-sm font-medium">Teste de impressão 60 x 40 mm</p>
                                        <p className="text-muted-foreground text-sm">
                                            Gera uma etiqueta térmica de teste usando a ordem inicial informada acima.
                                        </p>
                                    </div>
                                    <Button type="button" variant="outline" onClick={handleThermalTestPrint} className="w-full md:w-auto">
                                        <Printer />
                                        Imprimir teste 60 x 40 mm
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
