import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, MemoryStick, Save } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { maskCep, maskCpfCnpj, maskMoney, maskMoneyDot, maskPhone, unMask } from "@/Utils/mask";
import { Switch } from "@/components/ui/switch";
import AlertSuccess from "@/components/app-alert-success";

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
        title: 'Editar',
        href: '#',
    },
];

export default function EditPart({ parts }: any) {
    const { flash } = usePage().props as any;
    const { data, setData, patch, progress, processing, reset, errors } = useForm({
        part_number: parts?.part_number,
        name: parts?.name,
        description: parts?.description,
        manufacturer: parts?.manufacturer,
        model_compatibility: parts?.model_compatibility,
        cost_price: parts?.cost_price,
        sale_price: parts?.sale_price,
        quantity: parts?.quantity,
        minimum_stock_level: parts?.minimum_stock_level,
        location: parts?.location,
        status: parts?.status
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        patch(route('app.parts.update', parts?.id));
    }

    return (
        <AppLayout>
            <Head title="Peças" />
            {flash.message && <AlertSuccess message={flash.message} />}
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
                    <form onSubmit={handleSubmit} autoComplete="off"className="space-y-8">
                        <div className="grid md:grid-cols-6 gap-4 mt-4">

                            <div className="grid gap-2">
                                <Label htmlFor="name">Part Number</Label>
                                <Input
                                    type="text"
                                    id="part_number"
                                    value={maskCpfCnpj(data.part_number)}
                                    onChange={(e) => setData('part_number', e.target.value)}
                                    readOnly
                                />
                                {errors.part_number && <div className="text-red-500 text-sm">{errors.part_number}</div>}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="name">Nome da peça</Label>
                                <Input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                            </div>

                            <div className="md:col-span-3 grid gap-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Input
                                    type="text"
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
                            </div>
                        </div>
                        <div className="grid md:grid-cols-5 gap-4 mt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="manufacturer">Fabricante</Label>
                                <Input
                                    type="text"
                                    id="manufacturer"
                                    value={data.manufacturer}
                                    onChange={(e) => setData('manufacturer', e.target.value)}
                                />
                                {errors.manufacturer && <div className="text-red-500 text-sm">{errors.manufacturer}</div>}
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="model_compatibility">Modelos compatíveis</Label>
                                <Input
                                    type="text"
                                    id="model_compatibility"
                                    value={maskCep(data.model_compatibility)}
                                    onChange={(e) => setData('model_compatibility', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="location">Local de armazenamento</Label>
                                <Input
                                    type="text"
                                    id="location"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-4 gap-4 mt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cost_price">Preço de custo</Label>
                                <Input
                                    type="text"
                                    id="cost_price"
                                    value={maskMoney(data.cost_price)}
                                    onChange={(e) => setData('cost_price', e.target.value)}
                                />
                                {errors.cost_price && <div className="text-red-500 text-sm">{errors.cost_price}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sale_price">Preço de venda</Label>
                                <Input
                                    type="text"
                                    id="sale_price"
                                    value={maskMoney(data.sale_price)}
                                    onChange={(e) => setData('sale_price', e.target.value)}
                                />
                                {errors.sale_price && <div className="text-red-500 text-sm">{errors.sale_price}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Quantidade em estoque</Label>
                                <Input
                                    type="number"
                                    id="quantity"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    disabled
                                />
                                {errors.quantity && <div className="text-red-500 text-sm">{errors.quantity}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="minimum_stock_level">Estoque mínimo</Label>
                                <Input
                                    type="number"
                                    id="minimum_stock_level"
                                    value={data.minimum_stock_level}
                                    onChange={(e) => setData('minimum_stock_level', e.target.value)}
                                />
                                {errors.minimum_stock_level && <div className="text-red-500 text-sm">{errors.minimum_stock_level}</div>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status da peça</Label>
                            <Switch
                                id="status"
                                checked={data.status}
                                onCheckedChange={(checked: any) => setData('status', checked)}
                            />
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
