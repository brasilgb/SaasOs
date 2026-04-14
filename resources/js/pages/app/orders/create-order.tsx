import { toastSuccess } from '@/components/app-toast-messages';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DatePicker } from '@/components/date-picker';
import FormFieldHelp from '@/components/form-field-help';
import { Icon } from '@/components/icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, OptionType } from '@/types';
import { statusOrcamento } from '@/Utils/dataSelect';
import { maskMoney, maskMoneyDot } from '@/Utils/mask';
import selectStyles from '@/Utils/selectStyles';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Ordens',
        href: route('app.orders.index'),
    },
    {
        title: 'Adicionar',
        href: '#',
    },
];

export default function CreateOrder({
    customers,
    equipments,
    models,
}: {
    customers: { id: number; name: string }[];
    equipments: { id: number; equipment: string }[];
    models: string[];
}) {
    const initialModelOptions: OptionType[] = models.map((model) => ({
        value: model,
        label: model,
    }));

    const [modelOptions, setModelOptions] = useState<OptionType[]>(initialModelOptions);
    const [selectedModel, setSelectedModel] = useState<OptionType | null>(null);

    const optionsCustomer: OptionType[] = customers.map((customer) => ({
        value: customer.id,
        label: customer.name,
    }));

    const optionsEquipment: OptionType[] = equipments.map((equipment) => ({
        value: equipment.id,
        label: equipment.equipment,
    }));

    const { data, setData, post, processing, reset, errors } = useForm({
        customer_id: '',
        equipment_id: '', // equipamento
        model: '',
        password: '',
        defect: '',
        state_conservation: '', //estado de conservação
        accessories: '',
        budget_description: '', // descrição do orçamento
        budget_value: '', // valor do orçamento
        service_status: '1',
        delivery_forecast: '', // previsao de entrega
        observations: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('app.orders.store'), {
            onSuccess: () => {
                toastSuccess('Sucesso', 'Ordem de serviço gerada com sucesso');
                reset();
            },
        });
    };

    useEffect(() => {
        setData('budget_value', maskMoneyDot(String(data.budget_value)));
    }, [data.budget_value]);

    const changeCustomer = (selected: OptionType | null) => {
        setData('customer_id', String(selected?.value ?? ''));
    };

    const changeEquipment = (selected: OptionType | null) => {
        setData('equipment_id', String(selected?.value ?? ''));
    };

    const changeServiceStatus = (selected: OptionType | null) => {
        setData('service_status', String(selected?.value ?? ''));
    };

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

    return (
        <AppLayout>
            <Head title="Ordens" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Wrench} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Ordens</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div>
                    <Button variant={'default'} asChild>
                        <Link href={route('app.orders.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
                        <div className="mt-4 grid gap-4 md:grid-cols-8">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="customer_id">Cliente</Label>
                                <Select<OptionType, false>
                                    options={optionsCustomer}
                                    onChange={changeCustomer}
                                    placeholder="Selecione o cliente"
                                    className="h-9 rounded-md border border-gray-300 p-0 text-gray-500 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                            ...baseStyles,
                                            fontSize: '14px',
                                            boxShadow: 'none',
                                            border: 'none',
                                            background: 'transparent',
                                            paddingBottom: '2px',
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            color: '#111827',
                                            fontSize: '14px',
                                        }),
                                        dropdownIndicator: (base) => ({
                                            ...base,
                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            fontSize: '14px',
                                        }),
                                    }}
                                />
                                <InputError className="mt-2" message={errors.customer_id} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="equipment">Equipamento</Label>
                                <Select<OptionType, false>
                                    menuPosition="fixed"
                                    options={optionsEquipment}
                                    onChange={changeEquipment}
                                    placeholder="Selecione o equipamento"
                                    className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                            ...baseStyles,
                                            fontSize: '14px',
                                            boxShadow: 'none',
                                            border: 'none',
                                            background: 'transparent',
                                            paddingBottom: '2px',
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            color: '#111827',
                                            fontSize: '14px',
                                        }),
                                        dropdownIndicator: (base) => ({
                                            ...base,
                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            fontSize: '14px',
                                        }),
                                    }}
                                />
                                {errors.equipment_id && <div className="text-sm text-red-500">{errors.equipment_id}</div>}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <FormFieldHelp label="Marca e Modelo" content={`Selecione ou clique em Criar "marca/modelo digitado".`} />
                                <CreatableSelect<OptionType, false>
                                    value={selectedModel}
                                    options={modelOptions}
                                    onChange={changeModel}
                                    onCreateOption={createModel}
                                    isClearable
                                    styles={selectStyles}
                                    placeholder="Selecione ou digite a nova marca/modelo"
                                    className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    formatCreateLabel={(inputValue) => `Criar "${inputValue}"`}
                                />
                                <InputError message={errors.model} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input type="text" id="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="delivery_forecast">Previsão de entrega</Label>
                                <DatePicker
                                    mode="single"
                                    date={data.delivery_forecast}
                                    setDate={(value) => {
                                        if (!value) {
                                            setData('delivery_forecast', '');
                                            return;
                                        }
                                        const d = value as Date;
                                        const formatted = [
                                            d.getFullYear(),
                                            String(d.getMonth() + 1).padStart(2, '0'),
                                            String(d.getDate()).padStart(2, '0'),
                                        ].join('-');

                                        setData('delivery_forecast', formatted);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="defect">Defeito relatado</Label>
                                <Textarea id="defect" value={data.defect} onChange={(e) => setData('defect', e.target.value)} />
                                {errors.defect && <div className="text-sm text-red-500">{errors.defect}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="state_conservation">Estado de conservação</Label>
                                <Textarea
                                    id="state_conservation"
                                    value={data.state_conservation}
                                    onChange={(e) => setData('state_conservation', e.target.value)}
                                />
                                {errors.state_conservation && <div>{errors.state_conservation}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="accessories">Acessórios</Label>
                                <Textarea id="accessories" value={data.accessories} onChange={(e) => setData('accessories', e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-4">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="budget_description">Descrição pré-orcamento</Label>
                                <Textarea
                                    id="budget_description"
                                    value={data.budget_description}
                                    onChange={(e) => setData('budget_description', e.target.value)}
                                />
                                {errors.budget_description && <div className="text-sm text-red-500">{errors.budget_description}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="budget_value">Valor pré-orçamento</Label>
                                <Input
                                    type="text"
                                    id="budget_value"
                                    value={maskMoney(data.budget_value)}
                                    onChange={(e) => setData('budget_value', maskMoneyDot(e.target.value))}
                                />
                                {errors.budget_value && <div className="text-sm text-red-500">{errors.budget_value}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="service_status">Status orçamento</Label>
                                <Select<OptionType, false>
                                    menuPosition="fixed"
                                    options={statusOrcamento}
                                    onChange={changeServiceStatus}
                                    placeholder="Selecione o status"
                                    defaultValue={[{ value: statusOrcamento[0].value, label: statusOrcamento[0].label }]}
                                    className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                            ...baseStyles,
                                            fontSize: '14px',
                                            boxShadow: 'none',
                                            border: 'none',
                                            background: 'transparent',
                                            paddingBottom: '2px',
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            color: '#111827',
                                            fontSize: '14px',
                                        }),
                                        dropdownIndicator: (base) => ({
                                            ...base,
                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            fontSize: '14px',
                                        }),
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="observations">Observações</Label>
                            <Textarea id="observations" value={data.observations} onChange={(e) => setData('observations', e.target.value)} />
                            {errors.observations && <div className="text-sm text-red-500">{errors.observations}</div>}
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
    );
}
