import { Button } from "@/components/ui/button";
import { useForm, usePage } from "@inertiajs/react";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { maskMoney, maskMoneyDot, unMask } from "@/Utils/mask";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import {apios} from "@/Utils/connectApi";
import CreatableSelect from "react-select/creatable";
import InputError from "@/components/input-error";
import selectStyles from "@/Utils/selectStyles";
import { OptionType } from "@/types";
import { toastSuccess } from "@/components/app-toast-messages";

interface PartFormProps {
    categories: any;
    initialData?: any;
}


export default function PartForm({ categories, initialData }: PartFormProps) {
    const isEdit = !!initialData
    const [disableInput, setDisableInput] = useState(false);
    const initialCategoryOptions: OptionType[] = categories?.map((category: any) => ({
        value: category,
        label: category,
    }));

    const { data, setData, post, patch, progress, processing, reset, errors } = useForm({
        category: initialData?.category ?? "",
        reference_number: initialData?.reference_number ?? "",
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
        manufacturer: initialData?.manufacturer ?? "",
        model_compatibility: initialData?.model_compatibility ?? "",
        cost_price: initialData?.cost_price ?? "",
        sale_price: initialData?.sale_price ?? "",
        quantity: initialData?.quantity ?? "",
        minimum_stock_level: initialData?.minimum_stock_level ?? "",
        location: initialData?.location ?? "",
        status: initialData?.status ?? ""
    });

    const [categoryOptions, setCategoryOptions] = useState<OptionType[]>(initialCategoryOptions)
    const defaultCategory = categoryOptions.find(o => o.value === initialData?.category) ?? null
    const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(defaultCategory)

    const handleSubmit = (e: any) => {
        e.preventDefault();

        if (isEdit) {
            patch(route("app.parts.update", initialData.id), {
                onSuccess: () => {
                    toastSuccess("Sucesso", "Peça/Produto atualizado com sucesso")
                },
            })
        } else {
            post(route("app.parts.store"), {
                onSuccess: () => {
                    toastSuccess("Sucesso", "Peça/Produto cadastrado com sucesso")
                    reset()
                    setSelectedCategory(null)
                },
            })
        }
    }

    const partNumberDataSelected = async (e: any) => {
        e.preventDefault();
        const valuePartNumber = e.target.value;

        try {
            const { data: response } = await apios.get(`getparts/${valuePartNumber}`);
            const { success, parts } = response;

            if (success && parts) {
                const option = {
                    label: parts.category,
                    value: parts.category,
                };
 
                setDisableInput(true);
                setSelectedCategory(option);

                setData(data => ({
                    ...data,
                    category: parts.category,
                    name: parts.name,
                    description: parts.description,
                    manufacturer: parts.manufacturer,
                    model_compatibility: parts.model_compatibility,
                    cost_price: parts.cost_price,
                    sale_price: parts.sale_price,
                    quantity: '0',
                    minimum_stock_level: parts.minimum_stock_level,
                    location: parts.location,
                    status: parts.status,
                }));
            } else {
                setDisableInput(false);

                reset(
                    'name',
                    'description',
                    'manufacturer',
                    'model_compatibility',
                    'quantity',
                    'minimum_stock_level',
                    'location',
                    'status'
                );
            }
        } catch (error) {
            console.error(error);
        }
    };


    useEffect(() => {
        setData((data: any) => ({ ...data, cost_price: maskMoneyDot(data.cost_price) }));
        setData((data: any) => ({ ...data, sale_price: maskMoneyDot(data.sale_price) }));
    }, [data.cost_price, data.sale_price])

    const changeCategory = (option: OptionType | null) => {
        setSelectedCategory(option)
        setData("category", option ? option.value : "")
    }

    const createCategory = (value: string) => {
        const option = { label: value, value }
        setCategoryOptions(prev => [...prev, option])
        setSelectedCategory(option)
        setData("category", value)
    }

    return (

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
            <div className="grid md:grid-cols-6 gap-4 mt-4">

                <div className="grid gap-2">
                    <Label>Categoria (ou criar nova)</Label>
                    <CreatableSelect
                        value={selectedCategory}
                        options={categoryOptions}
                        onChange={changeCategory}
                        onCreateOption={createCategory}
                        isClearable
                        styles={selectStyles}
                        placeholder="Selecione ou digite a nova"
                        className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
                    />
                    <InputError message={errors.category} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="name">Número da Peça/Produto</Label>
                    <Input
                        type="text"
                        id="reference_number"
                        value={data.reference_number}
                        onChange={(e) => setData('reference_number', e.target.value)}
                        onBlur={(e) => partNumberDataSelected(e)}
                        maxLength={18}
                    />
                    {errors.reference_number && <div className="text-red-500 text-sm">{errors.reference_number}</div>}
                </div>

                <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="name">Nome da Peça/Produto</Label>
                    <Input
                        type="text"
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        readOnly={disableInput}
                    />
                    {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                </div>

                <div className="grid gap-2 md:col-span-2">
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

            <div className="grid gap-4 mt-4 md:grid-cols-3">
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

                <div className="grid gap-2">
                    <Label htmlFor="model_compatibility">Modelos compatíveis</Label>
                    <Input
                        type="text"
                        id="model_compatibility"
                        value={data.model_compatibility}
                        onChange={(e) => setData('model_compatibility', e.target.value)}
                        readOnly={disableInput}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="location">Local de Armazenamento</Label>
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
                    <Label htmlFor="cost_price">Preço de Custo</Label>
                    <Input
                        type="text"
                        id="cost_price"
                        value={maskMoney(data.cost_price)}
                        onChange={(e) => setData('cost_price', e.target.value)}
                        readOnly={disableInput}
                        placeholder="0"
                    />
                    {errors.cost_price && <div className="text-red-500 text-sm">{errors.cost_price}</div>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="sale_price">Preço de Venda</Label>
                    <Input
                        type="text"
                        id="sale_price"
                        value={maskMoney(data.sale_price)}
                        onChange={(e) => setData('sale_price', e.target.value)}
                        readOnly={disableInput}
                        placeholder="0"
                    />
                    {errors.sale_price && <div className="text-red-500 text-sm">{errors.sale_price}</div>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantidade em Estoque</Label>
                    <Input
                        type="text"
                        id="quantity"
                        value={data.quantity}
                        onChange={(e) => setData('quantity', e.target.value)}
                        placeholder="0"
                    />
                    {errors.quantity && <div className="text-red-500 text-sm">{errors.quantity}</div>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="minimum_stock_level">Estoque Mínimo</Label>
                    <Input
                        type="text"
                        id="minimum_stock_level"
                        value={data.minimum_stock_level}
                        onChange={(e) => setData('minimum_stock_level', e.target.value)}
                        readOnly={disableInput}
                        placeholder="0"
                    />
                    {errors.minimum_stock_level && <div className="text-red-500 text-sm">{errors.minimum_stock_level}</div>}
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="status">Status da Peça</Label>
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
    )
}
