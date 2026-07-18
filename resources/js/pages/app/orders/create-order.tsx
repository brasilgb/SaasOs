import { DatePicker } from '@/components/date-picker';
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
import { useEffect } from 'react';
import Select from 'react-select';
import EquipmentTypesModal from './equipment-types-modal';

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
    sourceSchedule,
    warrantySourceOrders,
}: {
    customers: { id: number; name: string }[];
    equipments: { id: number; equipment: string }[];
    sourceSchedule?: { id: number; customer_id: number; user_id?: number | null; schedules?: string | null; customer?: { name: string } } | null;
    warrantySourceOrders: Array<{
        id: number;
        order_number: number;
        customer_id: number;
        equipment_id: number;
        model?: string | null;
        warranty_expires_at: string;
    }>;
}) {
    const { flash, auth } = usePage().props as any;
    const canManageEquipments = auth?.permissions?.includes('register_equipments');

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
        is_warranty_return: false,
        warranty_source_order_id: '',
        service_status: '1',
        delivery_forecast: '', // previsao de entrega
        observations: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('app.orders.store'));
    };

    useEffect(() => {
        setData('budget_value', maskMoneyDot(String(data.budget_value)));
    }, [data.budget_value]);

    useEffect(() => {
        if (flash?.success) {
            reset();
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

    const defaultCustomer = optionsCustomer.find((option) => String(option.value) === String(data.customer_id)) ?? null;
    const selectedEquipment = optionsEquipment.find((option) => String(option.value) === String(data.equipment_id)) ?? null;
    const eligibleWarrantyOrders = warrantySourceOrders.filter(
        (item) => String(item.customer_id) === String(data.customer_id) && String(item.equipment_id) === String(data.equipment_id),
    );

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
                                <div className="flex min-w-0 items-center gap-2">
                                    <Select<OptionType, false>
                                        menuPosition="fixed"
                                        value={selectedEquipment}
                                        options={optionsEquipment}
                                        onChange={changeEquipment}
                                        placeholder="Selecione o equipamento"
                                        className="min-w-0 flex-1 text-gray-700"
                                        styles={selectStyles}
                                    />
                                    {canManageEquipments && (
                                        <EquipmentTypesModal
                                            equipments={equipments}
                                            selectedEquipmentId={data.equipment_id}
                                            onSelectEquipment={(equipmentId) => setData('equipment_id', equipmentId)}
                                        />
                                    )}
                                </div>
                                {errors.equipment_id && <div className="text-sm text-red-500">{errors.equipment_id}</div>}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="model">Marca e Modelo</Label>
                                <Input
                                    type="text"
                                    id="model"
                                    value={data.model}
                                    onChange={(e) => setData('model', e.target.value)}
                                    placeholder="Digite a marca e o modelo"
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

                            <div className="grid gap-2 md:col-span-2">
                                <label className="flex items-center gap-2 font-medium">
                                    <input
                                        type="checkbox"
                                        checked={data.is_warranty_return}
                                        onChange={(event) => {
                                            setData('is_warranty_return', event.target.checked);
                                            if (!event.target.checked) setData('warranty_source_order_id', '');
                                        }}
                                    />
                                    Esta nova OS é um retorno em garantia de outra OS
                                </label>
                                {data.is_warranty_return && (
                                    <select
                                        value={data.warranty_source_order_id}
                                        onChange={(event) => setData('warranty_source_order_id', event.target.value)}
                                        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                                    >
                                        <option value="">Selecione a OS de origem</option>
                                        {eligibleWarrantyOrders.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                OS #{item.order_number}{item.model ? ` • ${item.model}` : ''} • garantia até{' '}
                                                {new Date(item.warranty_expires_at).toLocaleDateString('pt-BR')}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {data.is_warranty_return && eligibleWarrantyOrders.length === 0 && (
                                    <p className="text-sm text-amber-700">Não há OS entregue com garantia ativa para este cliente e equipamento.</p>
                                )}
                                {errors.warranty_source_order_id && <div className="text-sm text-red-500">{errors.warranty_source_order_id}</div>}
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
