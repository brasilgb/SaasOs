import { toastSuccess } from '@/components/app-toast-messages';
import FormFieldHelp from '@/components/form-field-help';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { OptionType } from '@/types';
import { apios } from '@/Utils/connectApi';
import { partsType } from '@/Utils/dataSelect';
import { maskMoney, maskMoneyDot } from '@/Utils/mask';
import selectStyles from '@/Utils/selectStyles';
import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';

interface PartFormProps {
    categories: any;
    manufacturers: any;
    initialData?: any;
}

export default function PartForm({ categories, manufacturers, initialData }: PartFormProps) {
    const isEdit = !!initialData;
    const [disableInput, setDisableInput] = useState(false);

    const initialCategoryOptions: OptionType[] = categories?.map((category: any) => ({
        value: category,
        label: category,
    }));

    const initialManufacturerOptions: OptionType[] = manufacturers?.map((manufacturer: any) => ({
        value: manufacturer,
        label: manufacturer,
    }));

    const { data, setData, post, patch, progress, processing, reset, errors } = useForm({
        category: initialData?.category ?? '',
        type: initialData?.type ?? '',
        is_sellable: initialData?.is_sellable ?? '',
        reference_number: initialData?.reference_number ?? '',
        name: initialData?.name ?? '',
        description: initialData?.description ?? '',
        manufacturer: initialData?.manufacturer ?? '',
        model_compatibility: initialData?.model_compatibility ?? '',
        cost_price: initialData?.cost_price ?? '',
        sale_price: initialData?.sale_price ?? '',
        quantity: initialData?.quantity ?? '',
        minimum_stock_level: initialData?.minimum_stock_level ?? '',
        location: initialData?.location ?? '',
        status: initialData?.status ?? '',
    });

    const [categoryOptions, setCategoryOptions] = useState<OptionType[]>(initialCategoryOptions);
    const defaultCategory = categoryOptions.find((o) => o.value === initialData?.category) ?? null;
    const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(defaultCategory);

    const [manufacturerOptions, setManufacturerOptions] = useState<OptionType[]>(initialManufacturerOptions);
    const defaultManufacturer = manufacturerOptions.find((o) => o.value === initialData?.manufacturer) ?? null;
    const [selectedManufacturer, setSelectedManufacturer] = useState<OptionType | null>(defaultManufacturer);

    const defaultPartsType = partsType?.filter((part: any) => Number(part.value) === initialData?.type);
    const [selectedPartsType, setSelectedPartsType] = useState<any>(defaultPartsType);
    const [insertStock, setInsertStock] = useState<any>(false);

    const handleSubmit = (e: any) => {
        e.preventDefault();

        if (isEdit) {
            patch(route('app.parts.update', initialData.id), {
                onSuccess: () => {
                    toastSuccess('Sucesso', 'Peça/Produto atualizado com sucesso');
                },
            });
        } else {
            post(route('app.parts.store'), {
                onSuccess: () => {
                    toastSuccess('Sucesso', 'Peça/Produto cadastrado com sucesso');
                    reset();
                    setSelectedCategory(null);
                },
            });
        }
    };

    const partNumberDataSelected = async (e: any) => {
        e.preventDefault();
        const valuePartNumber = e.target.value;

        try {
            const { data: response } = await apios.get(`getparts/${valuePartNumber}`);
            const { success, parts } = response;

            if (success && parts) {
                const optionCat = {
                    label: parts.category,
                    value: parts.category,
                };

                const optionMan = {
                    label: parts.manufacturer,
                    value: parts.manufacturer,
                };

                setDisableInput(true);
                setSelectedCategory(optionCat);
                setSelectedManufacturer(optionMan);
                setInsertStock(true);

                setData((data) => ({
                    ...data,
                    category: parts.category,
                    type: parts.type,
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
                    is_sellable: parts.type,
                }));
            } else {
                setDisableInput(false);

                reset('name', 'description', 'manufacturer', 'model_compatibility', 'quantity', 'location', 'status', 'type', 'is_sellable');
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        setData((data: any) => ({ ...data, cost_price: maskMoneyDot(data.cost_price) }));
        setData((data: any) => ({ ...data, sale_price: maskMoneyDot(data.sale_price) }));
    }, [data.cost_price, data.sale_price]);

    const changeCategory = (option: OptionType | null) => {
        setSelectedCategory(option);
        setData('category', option ? option.value : '');
    };

    const createCategory = (value: string) => {
        const option = { label: value, value };
        setCategoryOptions((prev) => [...prev, option]);
        setSelectedCategory(option);
        setData('category', value);
    };

    const changeManufacturer = (option: OptionType | null) => {
        setSelectedManufacturer(option);
        setData('manufacturer', option ? option.value : '');
    };

    const createManufacturer = (value: string) => {
        const option = { label: value, value };
        setManufacturerOptions((prev) => [...prev, option]);
        setSelectedManufacturer(option);
        setData('manufacturer', value);
    };

    return (
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
            <Card>
                <CardTitle className="border-b px-6 pb-4">Identificação</CardTitle>
                <CardContent className="space-y-4 pt-6">
            <div className="mt-4 grid gap-4 md:grid-cols-4">
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
                    {errors.reference_number && <div className="text-sm text-red-500">{errors.reference_number}</div>}
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label>Tipo</Label>

                        <span className={`text-xs ${!data.type ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            {!data.type && 'Selecione o tipo do item'}
                            {data.type === 'part' && 'Item técnico (uso interno ou venda)'}
                            {data.type === 'product' && 'Produto final para venda'}
                        </span>
                    </div>

                    {/* Tipo (identidade) */}
                    <div className="flex items-center justify-between gap-6 rounded-md border p-2.5">
                        <div className="flex items-center justify-between gap-4">
                            <label className="flex cursor-pointer items-center gap-2">
                                <input type="radio" name="type" checked={data.type === 'part'} onChange={() => setData('type', 'part')} />
                                <span className="text-sm">Peça</span>
                            </label>

                            <label className="flex cursor-pointer items-center gap-2">
                                <input type="radio" name="type" checked={data.type === 'product'} onChange={() => setData('type', 'product')} />
                                <span className="text-sm">Produto</span>
                            </label>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground text-sm">Para venda</span>

                            <Switch checked={data.is_sellable} onCheckedChange={(checked) => setData('is_sellable', checked)} />
                        </div>
                    </div>

                    {/* Pode ser vendido */}

                    {errors.type && <div className="text-sm text-red-500">{errors.type}</div>}
                </div>

                <div className="grid gap-2">
                    <FormFieldHelp label="Categoria" content={`Selecione ou clique em Criar "categoria digitada".`} />
                    <CreatableSelect<OptionType, false>
                        value={selectedCategory}
                        options={categoryOptions}
                        onChange={changeCategory}
                        onCreateOption={createCategory}
                        isClearable
                        styles={selectStyles}
                        placeholder="Selecione ou digite a nova categoria"
                        className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        formatCreateLabel={(inputValue) => `Criar "${inputValue}"`}
                    />
                    <InputError message={errors.category} />
                </div>

                <div className="grid gap-2">
                    <FormFieldHelp label="Fabricante" content={`Selecione ou clique em Criar "fabricante digitado".`} />
                    <CreatableSelect<OptionType, false>
                        value={selectedManufacturer}
                        options={manufacturerOptions}
                        onChange={changeManufacturer}
                        onCreateOption={createManufacturer}
                        isClearable
                        styles={selectStyles}
                        placeholder="Selecione ou digite o novo fabricante"
                        className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        formatCreateLabel={(inputValue) => `Criar "${inputValue}"`}
                    />
                    <InputError message={errors.manufacturer} />
                </div>
            </div>
                </CardContent>
            </Card>

            <Card>
                <CardTitle className="border-b px-6 pb-4">Descrição e compatibilidade</CardTitle>
                <CardContent className="space-y-4 pt-6">
            <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                    <Label htmlFor="name">Nome da Peça/Produto</Label>
                    <Input type="text" id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} readOnly={disableInput} />
                    {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
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
                    {errors.description && <div className="text-sm text-red-500">{errors.description}</div>}
                </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                </CardContent>
            </Card>

            <Card>
                <CardTitle className="border-b px-6 pb-4">Valores e estoque</CardTitle>
                <CardContent className="space-y-4 pt-6">
            <div className="mt-4 grid gap-4 md:grid-cols-4">
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
                    {errors.cost_price && <div className="text-sm text-red-500">{errors.cost_price}</div>}
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
                    {errors.sale_price && <div className="text-sm text-red-500">{errors.sale_price}</div>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="quantity">{insertStock ? 'Inserir ao Estoque' : isEdit ? 'Alterar Estoque' : 'Quantidade do Estoque'}</Label>
                    <Input type="text" id="quantity" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} placeholder="0" />
                    {errors.quantity && <div className="text-sm text-red-500">{errors.quantity}</div>}
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
                    {errors.minimum_stock_level && <div className="text-sm text-red-500">{errors.minimum_stock_level}</div>}
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="status">Status da Peça</Label>

                <div className="flex items-center gap-3">
                    <Switch id="status" checked={data.status} onCheckedChange={(checked) => setData('status', checked)} />

                    <span className="text-muted-foreground text-sm">{data.status ? 'Ativa' : 'Inativa'}</span>
                </div>
            </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                    <Save />
                    Salvar
                </Button>
            </div>
        </form>
    );
}
