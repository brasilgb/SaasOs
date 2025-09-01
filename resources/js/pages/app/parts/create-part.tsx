import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, MemoryStick, Save, Users } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { maskCep, maskCpfCnpj, maskMoney, maskMoneyDot, maskPhone, unMask } from "@/Utils/mask";
import { toast } from "sonner";
import apios from "@/Utils/connectApi";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

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

export default function CreatePart() {
    const { flash } = usePage().props as any;
    const [disableInput, setDisableInput] = useState(false);
    const { data, setData, post, progress, processing, reset, errors } = useForm({
        part_number: '',
        name: '',
        description: '',
        manufacturer: '',
        model_compatibility: '',
        cost_price: '',
        sale_price: '',
        stock_quantity: '',
        minimum_stock_level: '',
        location: '',
        is_active: false
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        post(route('app.parts.store'), {
            onSuccess: () => reset(),
        });
    }

    const partNumberDataSelected = async (e: any) => {
        e.preventDefault();
        let valuePartNumber = e.target.value;

        try {
            const getPartsForPartNumber = await apios.get(`getparts/${valuePartNumber}`)
            const { success, parts } = getPartsForPartNumber.data;

            if (success && parts) {
                setDisableInput(true)
                setData((data) => ({ ...data, name: parts.name }));
                setData((data) => ({ ...data, description: parts.description }));
                setData((data) => ({ ...data, manufacturer: parts.manufacturer }));
                setData((data) => ({ ...data, model_compatibility: parts.model_compatibility }));
                setData((data) => ({ ...data, cost_price: parts.cost_price }));
                setData((data) => ({ ...data, sale_price: parts.sale_price }));
                setData((data) => ({ ...data, stock_quantity: '0' }));
                setData((data) => ({ ...data, minimum_stock_level: parts.minimum_stock_level }));
                setData((data) => ({ ...data, location: parts.location }));
                setData((data) => ({ ...data, is_active: parts.is_active }));
            } else {
                setDisableInput(false)
                reset(
                    'name',
                    'description',
                    'manufacturer',
                    'model_compatibility',
                    'stock_quantity',
                    'minimum_stock_level',
                    'location',
                    'is_active'
                )
                setData((data) => ({ ...data, cost_price: '0' }));
                setData((data) => ({ ...data, sale_price: '0' }));
            }

        } catch (error) {
            console.log(error);

        }
    }

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

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-6 gap-4 mt-4">

                            <div className="grid gap-2">
                                <Label htmlFor="name">Part Number</Label>
                                <Input
                                    type="text"
                                    id="part_number"
                                    value={maskCpfCnpj(data.part_number)}
                                    onChange={(e) => setData('part_number', e.target.value)}
                                    onBlur={(e) => partNumberDataSelected(e)}
                                    maxLength={18}
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
                                    readOnly={disableInput}
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
                                    readOnly={disableInput}
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
                                    readOnly={disableInput}
                                />
                                {errors.manufacturer && <div className="text-red-500 text-sm">{errors.manufacturer}</div>}
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="model_compatibility">Modelos compatíveis</Label>
                                <Input
                                    type="text"
                                    id="model_compatibility"
                                    value={data.model_compatibility}
                                    onChange={(e) => setData('model_compatibility', e.target.value)}
                                    readOnly={disableInput}
                                />
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="location">Local de armazenamento</Label>
                                <Input
                                    type="text"
                                    id="location"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    readOnly={disableInput}
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
                                    readOnly={disableInput}
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
                                    readOnly={disableInput}
                                />
                                {errors.sale_price && <div className="text-red-500 text-sm">{errors.sale_price}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="stock_quantity">Quantidade em estoque</Label>
                                <Input
                                    type="number"
                                    id="stock_quantity"
                                    value={data.stock_quantity}
                                    onChange={(e) => setData('stock_quantity', e.target.value)}
                                />
                                {errors.stock_quantity && <div className="text-red-500 text-sm">{errors.stock_quantity}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="minimum_stock_level">Estoque mínimo</Label>
                                <Input
                                    type="number"
                                    id="minimum_stock_level"
                                    value={data.minimum_stock_level}
                                    onChange={(e) => setData('minimum_stock_level', e.target.value)}
                                    readOnly={disableInput}
                                />
                                {errors.minimum_stock_level && <div className="text-red-500 text-sm">{errors.minimum_stock_level}</div>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="is_active">Status da peça</Label>
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked: any) => setData('is_active', checked)}
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
