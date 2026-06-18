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
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Printer, Save, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel',
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
    sourceSchedule,
}: {
    customers: { id: number; name: string }[];
    equipments: { id: number; equipment: string }[];
    models: string[];
    sourceSchedule?: { id: number; customer_id: number; user_id?: number | null; schedules?: string | null; customer?: { name: string } } | null;
}) {
    const { flash } = usePage().props as any;
    const initialModelOptions: OptionType[] = models.map((model) => ({
        value: model,
        label: model,
    }));

    const [modelOptions, setModelOptions] = useState<OptionType[]>(initialModelOptions);
    const [selectedModel, setSelectedModel] = useState<OptionType | null>(null);
    const [modelInputValue, setModelInputValue] = useState('');

    const optionsCustomer: OptionType[] = customers.map((customer) => ({
        value: customer.id,
        label: customer.name,
    }));

    const optionsEquipment: OptionType[] = equipments.map((equipment) => ({
        value: equipment.id,
        label: equipment.equipment,
    }));

    const { data, setData, post, processing, reset, errors } = useForm({
        order_type: 'equipment',
        schedule_id: sourceSchedule?.id ?? '',
        customer_id: sourceSchedule?.customer_id ? String(sourceSchedule.customer_id) : '',
        equipment_id: '', // equipamento
        user_id: sourceSchedule?.user_id ? String(sourceSchedule.user_id) : '',
        model: '',
        password: '',
        defect: '',
        service_type: '',
        service_details: '',
        materials_used: '',
        state_conservation: '', //estado de conservação
        accessories: '',
        budget_description: '', // descrição do orçamento
        budget_value: '', // valor do orçamento
        warranty_days: '',
        service_status: '1',
        delivery_forecast: '', // previsao de entrega
        observations: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        commitModelInput();
        post(route('app.orders.store'));
    };

    useEffect(() => {
        setData('budget_value', maskMoneyDot(String(data.budget_value)));
    }, [data.budget_value]);

    useEffect(() => {
        if (flash?.success) {
            reset();
            setSelectedModel(null);
            setModelInputValue('');
            setModelOptions(initialModelOptions);
        }
    }, [flash?.id, flash?.success]);

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
        setModelInputValue('');
        setData('model', String(option?.value ?? ''));
    };

    const createModel = (value: string) => {
        const model = value.trim();
        if (!model) return;

        const option = { label: model, value: model };
        setModelOptions((prev) => [...prev, option]);
        setSelectedModel(option);
        setModelInputValue('');
        setData('model', model);
    };

    const commitModelInput = () => {
        const model = modelInputValue.trim();
        if (model && model !== data.model) {
            createModel(model);
        }
    };
    const defaultCustomer = optionsCustomer.find((option) => String(option.value) === String(data.customer_id)) ?? null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ordens" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Wrench} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Ordens</h2>
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
                        {flash?.label_print && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="font-medium text-emerald-900">Ordem #{flash.label_print.order_number} cadastrada</p>
                                        <p className="text-sm text-emerald-700">Etiqueta pronta para impressão.</p>
                                    </div>
                                    <Button type="button" asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
                                        <a href={flash.label_print.print_url} target="_blank" rel="noopener noreferrer">
                                            <Printer className="h-4 w-4" />
                                            Imprimir etiqueta
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {sourceSchedule && (
                            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                                Abrindo OS a partir do agendamento #{sourceSchedule.id}
                                {sourceSchedule.customer?.name ? ` de ${sourceSchedule.customer.name}` : ''}.
                            </div>
                        )}

                        <div className="mt-4 grid gap-4 md:grid-cols-8">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="customer_id">Cliente</Label>
                                <Select<OptionType, false>
                                    value={defaultCustomer}
                                    options={optionsCustomer}
                                    onChange={changeCustomer}
                                    placeholder="Selecione o cliente"
                                    className="text-gray-500"
                                    styles={selectStyles}
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
                                    className="text-gray-700"
                                    styles={selectStyles}
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
                                    onBlur={commitModelInput}
                                    onInputChange={(value, meta) => {
                                        if (meta.action === 'input-change') {
                                            setModelInputValue(value);
                                            setData('model', value);
                                        }
                                    }}
                                    isClearable
                                    classNamePrefix="creatable-select"
                                    className="min-w-0"
                                    menuPosition="fixed"
                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                    styles={selectStyles}
                                    placeholder="Selecione ou digite a nova marca/modelo"
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
                                <Label htmlFor="delivery_forecast">Previsão de entrega *</Label>
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
                                <InputError className="mt-2" message={errors.delivery_forecast} />
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
                                <Label htmlFor="warranty_days">Garantia em dias</Label>
                                <Input
                                    id="warranty_days"
                                    type="number"
                                    min="0"
                                    value={data.warranty_days}
                                    onChange={(e) => setData('warranty_days', e.target.value)}
                                    placeholder="Ex.: 90"
                                />
                                {errors.warranty_days && <div className="text-sm text-red-500">{errors.warranty_days}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="service_status">Status da ordem</Label>
                                <Select<OptionType, false>
                                    menuPosition="fixed"
                                    options={statusOrcamento}
                                    onChange={changeServiceStatus}
                                    placeholder="Selecione o status"
                                    defaultValue={[{ value: statusOrcamento[0].value, label: statusOrcamento[0].label }]}
                                    className="text-gray-700"
                                    styles={selectStyles}
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
