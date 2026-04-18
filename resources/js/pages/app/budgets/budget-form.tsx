import { toastSuccess } from '@/components/app-toast-messages';
import FormFieldHelp from '@/components/form-field-help';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Budget, OptionType } from '@/types';
import { warrantyOptions } from '@/Utils/dataSelect';
import { maskMoney, maskMoneyDot, unMask } from '@/Utils/mask';
import selectStyles from '@/Utils/selectStyles';
import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

interface BudgetFormProps {
    initialData?: Budget;
    budgets: Budget[];
    equipments: { id: number; equipment: string }[];
}

export default function BudgetForm({ initialData, budgets, equipments }: BudgetFormProps) {
    const isEdit = !!initialData;

    const initialModelOptions: OptionType[] = budgets?.map((bud) => ({
        value: bud.model,
        label: bud.model,
    }));

    const optionsEquipment: OptionType[] = equipments?.map((equipment) => ({
        value: equipment.id,
        label: equipment.equipment,
    }));

    /* =========================
     FORM STATE (INERTIA)
  ========================= */
    const { data, setData, post, patch, processing, reset, errors } = useForm({
        equipment_id: initialData?.equipment_id ?? '',
        service: initialData?.service ?? '',
        model: initialData?.model ?? '',
        description: initialData?.description ?? '',
        estimated_time: initialData?.estimated_time ?? '',
        part_value: initialData?.part_value ?? '',
        labor_value: initialData?.labor_value ?? '',
        total_value: initialData?.total_value ?? '',
        warranty: initialData?.warranty ?? '',
        validity: initialData?.validity ?? '',
        obs: initialData?.obs ?? '',
    });

    /* =========================
     SELECT OPTIONS
  ========================= */
    const [modelOptions, setModelOptions] = useState<OptionType[]>(initialModelOptions);

    const defaultModel = modelOptions.find((o) => o.value === initialData?.model) ?? null;

    const defaultWarranty = warrantyOptions.find((o) => o.value === initialData?.warranty) ?? null;
    const defaultEquipament = optionsEquipment.find((o) => o.value == initialData?.equipment_id) ?? null;

    const [selectedModel, setSelectedModel] = useState<OptionType | null>(defaultModel);

    const [selectedWarranty, setSelectedWarranty] = useState<OptionType | null>(defaultWarranty);

    useEffect(() => {
        const part = Number(unMask(String(data.part_value))) || 0;
        const labor = Number(unMask(String(data.labor_value))) || 0;
        const total = part + labor;

        setData((currentData) => ({
            ...currentData,
            part_value: maskMoneyDot(String(currentData.part_value)),
            labor_value: maskMoneyDot(String(currentData.labor_value)),
            total_value: maskMoneyDot(String(total)),
        }));
    }, [data.part_value, data.labor_value]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            patch(route('app.budgets.update', initialData!.id), {
                onSuccess: () => {
                    toastSuccess('Sucesso', 'Orçamento atualizado com sucesso');
                },
            });
        } else {
            post(route('app.budgets.store'), {
                onSuccess: () => {
                    toastSuccess('Sucesso', 'Orçamento criado com sucesso');
                    reset();
                    setSelectedModel(null);
                    setSelectedWarranty(null);
                },
            });
        }
    };

    /* =========================
     SELECT HANDLERS
  ========================= */
    const changeModel = (option: OptionType | null) => {
        setSelectedModel(option);
        setData('model', String(option?.value ?? ''));
    };

    const createModel = (value: string) => {
        const option = { label: value, value };
        setModelOptions((prev) => [...prev, option]);
        setSelectedModel(option);
        setData('model', value);
    };

    const changeWarranty = (option: OptionType | null) => {
        setSelectedWarranty(option);
        setData('warranty', String(option?.value ?? ''));
    };

    const changeEquipment = (selected: OptionType | null) => {
        setData('equipment_id', String(selected?.value ?? ''));
    };

    const textareaClass =
        'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
                <CardTitle className="border-b px-6 pb-4">Dados do orçamento</CardTitle>
                <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                    <Label htmlFor="equipment">Equipamento</Label>
                    <Select<OptionType, false>
                        menuPosition="fixed"
                        defaultValue={defaultEquipament}
                        options={optionsEquipment}
                        onChange={changeEquipment}
                        placeholder="Selecione o equipamento"
                        className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        styles={selectStyles}
                    />
                    {errors.equipment_id && <div className="text-sm text-red-500">{errors.equipment_id}</div>}
                </div>

                <div className="grid gap-2">
                    <FormFieldHelp label="Marca e Modelo" content={`Selecione ou clique em Criar "marca/modelo digitado".`} />
                    <CreatableSelect<OptionType, false>
                        value={selectedModel}
                        options={modelOptions}
                        onChange={changeModel}
                        onCreateOption={createModel}
                        isClearable
                        styles={selectStyles}
                        placeholder="Selecione ou digite nova marca/modelo"
                        className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        formatCreateLabel={(inputValue) => `Criar "${inputValue}"`}
                    />
                    <InputError message={errors.model} />
                </div>

                <div className="grid gap-2">
                    <Label>Serviço</Label>
                    <Input value={data.service} onChange={(e) => setData('service', e.target.value)} />
                    <InputError message={errors.service} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Descrição</Label>
                <textarea className={textareaClass} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                <InputError message={errors.description} />
            </div>
                </CardContent>
            </Card>

            <Card>
                <CardTitle className="border-b px-6 pb-4">Valores e condições</CardTitle>
                <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                    <Label>Valor Peças</Label>
                    <Input value={maskMoney(String(data.part_value))} onChange={(e) => setData('part_value', e.target.value)} />
                </div>

                <div className="grid gap-2">
                    <Label>Tempo Estimado do Serviço (Hs)</Label>
                    <Input value={data.estimated_time} onChange={(e) => setData('estimated_time', e.target.value)} />
                    <InputError message={errors.estimated_time} />
                </div>

                <div className="grid gap-2">
                    <Label>Garantia</Label>
                    <Select<OptionType, false>
                        value={selectedWarranty}
                        options={warrantyOptions}
                        onChange={changeWarranty}
                        isClearable
                        styles={selectStyles}
                        placeholder="Selecione ou defina a garantia"
                        className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <InputError message={errors.warranty} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                    <Label>Mão de Obra</Label>
                    <Input value={maskMoney(String(data.labor_value))} onChange={(e) => setData('labor_value', e.target.value)} />
                    <InputError message={errors.labor_value} />
                </div>

                <div className="grid gap-2">
                    <Label>Total</Label>
                    <Input value={maskMoney(String(data.total_value))} onChange={(e) => setData('total_value', e.target.value)} />
                    <InputError message={errors.total_value} />
                </div>

                <div className="grid gap-2">
                    <Label>Validade do orçamento(dias)</Label>
                    <Input value={String(data.validity)} onChange={(e) => setData('validity', e.target.value)} />
                    <InputError message={errors.validity} />
                </div>
            </div>
                </CardContent>
            </Card>

            <Card>
                <CardTitle className="border-b px-6 pb-4">Observações</CardTitle>
                <CardContent className="pt-6">
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label>Observações</Label>
                    <textarea className={textareaClass} value={data.obs} onChange={(e) => setData('obs', e.target.value)} />
                </div>
            </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                    <Save className="mr-2" />
                    {isEdit ? 'Atualizar' : 'Salvar'}
                </Button>
            </div>
        </form>
    );
}
