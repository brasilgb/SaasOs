import { toastSuccess } from '@/components/app-toast-messages';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DatePicker } from '@/components/date-picker';
import FormFieldHelp from '@/components/form-field-help';
import { Icon } from '@/components/icon';
import InputError from '@/components/input-error';
import InvoiceModal from '@/components/Modals/InvoiceModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, OptionType } from '@/types';
import { statusServico } from '@/Utils/dataSelect';
import { maskMoney, maskMoneyDot } from '@/Utils/mask';
import selectStyles from '@/Utils/selectStyles';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, FileTextIcon, Save, Wrench, X } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import AddPartsModal from './add-parts';
import OrderPaymentsModal from './order-payments-modal';
moment.locale('pt-br');

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
        title: 'Editar',
        href: '#',
    },
];

export default function EditOrder({
    customers,
    order,
    technicals,
    equipments,
    parts,
    orderparts,
    orderPayments,
    paymentSummary,
    page,
    search,
    models,
}: any) {
    const toMoneyNumber = (value: unknown): number => {
        if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
        const raw = String(value ?? '').trim();
        if (!raw) return 0;

        const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw.replace(/,/g, '');

        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const { othersetting, auth } = usePage().props as any;
    const canManageOrders = auth?.role !== 'technician' && auth?.permissions?.includes('orders');
    const [partsData, setPartsData] = useState<any>([]);

    const initialModelOptions = models.map((model: any) => ({
        value: model,
        label: model,
    }));

    const defaultModel = initialModelOptions.find((o: any) => o.value === order?.model) || null;

    const [modelOptions, setModelOptions] = useState<OptionType[]>(initialModelOptions);
    const [selectedModel, setSelectedModel] = useState<OptionType | null>(defaultModel);

    const optionsCustomer = customers.map((customer: any) => ({
        value: customer.id,
        label: customer.name,
    }));

    const optionsTechnical = technicals.map((technical: any) => ({
        value: technical.id,
        label: technical.name,
    }));

    const optionsEquipment = equipments.map((equipment: any) => ({
        value: equipment.id,
        label: equipment.equipment,
    }));

    const { data, post, setData, patch, progress, processing, reset, errors } = useForm({
        customer_id: order?.customer_id,
        equipment_id: order?.equipment_id, // equipamento
        user_id: order?.user_id,
        model: order?.model,
        password: order?.password,
        defect: order?.defect,
        state_conservation: order?.state_conservation, //estado de conservação
        accessories: order?.accessories,
        budget_description: order?.budget_description, // descrição do orçamento
        budget_value: order?.budget_value, // valor do orçamento
        services_performed: order.services_performed, // servicos executados
        parts_value: order.parts_value,
        service_value: order.service_value,
        service_cost: order.service_cost, // custo
        delivery_date: order.delivery_date,
        service_status: order?.service_status,
        delivery_forecast: order?.delivery_forecast, // previsao de entrega
        observations: order?.observations,
        allparts: '',
    });

    const [openInvoiceModal, setOpenInvoiceModal] = useState(false);

    const handleModalSubmit = (modalParts: any) => {
        setPartsData((currentLocalParts: any) => {
            const partsMap = new Map(currentLocalParts.map((p: any) => [p.id, p]));
            modalParts.forEach((part: any) => {
                partsMap.set(part.id, part); // Adiciona ou atualiza a peça
            });
            return Array.from(partsMap.values());
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        patch(route('app.orders.update', order.id), {
            onSuccess: () => {
                toastSuccess('Sucesso', 'Ordem de serviço alterada com sucesso');
                setPartsData([]);
            },
        });
    };

    useEffect(() => {
        const finalPartsMap = new Map();
        (orderparts || []).forEach((p: any) => finalPartsMap.set(p.id, { id: p.id, sale_price: p.sale_price, quantity: p.pivot.quantity }));
        (partsData || []).forEach((p: any) => finalPartsMap.set(p.id, { id: p.id, sale_price: p.sale_price, quantity: p.quantity }));

        const finalListWithDetails = Array.from(finalPartsMap.values());
        const allpartsPayload = finalListWithDetails.map((p) => ({ part_id: p.id, quantity: p.quantity }));

        // Calcula o total. Se não houver peças, o total é 0.
        const totalValue = finalListWithDetails.reduce((acc, p) => acc + toMoneyNumber(p.sale_price) * Number(p.quantity || 0), 0);

        setData((currentData: any) => ({
            ...currentData,
            allparts: allpartsPayload,
            // Se o total for 0 e não houver peças, fixa 0.
            // Removido a condição "totalValue ? totalValue : order?.parts_value"
            // que causava a insistência no valor antigo do banco.
            parts_value: totalValue.toFixed(2),
        }));
    }, [partsData, orderparts]);

    useEffect(() => {
        // Converte para número, mas garante que se for vazio ou NaN, vire 0
        const pValue = toMoneyNumber(data?.parts_value);
        const sValue = toMoneyNumber(data?.service_value);

        const total = pValue + sValue;

        // Atualiza o custo total formatado
        setData((prev: any) => ({
            ...prev,
            service_cost: total.toFixed(2),
        }));

        if (data.service_status == 8) {
            setData((data: any) => ({ ...data, delivery_date: moment().format('YYYY-MM-DD HH:mm:ss') }));
        }
    }, [data.parts_value, data.service_value, data.budget_value, data.delivery_date, data.service_status]);

    const changeCustomer = (selected: any) => {
        setData('customer_id', selected?.value || '');
    };

    const changeEquipment = (selected: any) => {
        setData('equipment_id', selected?.value);
    };

    const changeServiceStatus = (selected: any) => {
        setData('service_status', selected?.value);
    };

    const changeResponsibleTechnician = (selected: any) => {
        setData('user_id', selected?.value);
    };

    const defaultCustomer = optionsCustomer
        ?.filter((o: any) => o.value == order?.customer_id)
        .map((opt: any) => ({ value: opt.value, label: opt.label }));
    const defaultEquipament = optionsEquipment
        ?.filter((o: any) => o.value == order?.equipment_id)
        .map((opt: any) => ({ value: opt.value, label: opt.label }));
    const statusDefault = statusServico
        ?.filter((o: any) => o.value == order?.service_status)
        .map((opt: any) => ({ value: opt.value, label: opt.label }));
    const defaultTechnical = optionsTechnical
        ?.filter((o: any) => o.value == order?.user_id)
        .map((opt: any) => ({ value: opt.value, label: opt.label }));

    const handleRemovePartsOrder = (e: any, id: number) => {
        e.preventDefault();
        post(route('app.orders.removePart', { order_id: order.id, part_id: id }));
        // const calcTotal =
        setData((data: any) => ({ ...data, parts_value: '0' }));
        setData((data: any) => ({ ...data, service_value: '0' }));
        setData((data: any) => ({ ...data, service_cost: '0' }));
        setData((data: any) => ({ ...data, allparts: [] }));
        setPartsData([]);
    };

    const handleRemovePart = (partId: any) => {
        setPartsData((currentLocalParts: any) => currentLocalParts.filter((part: any) => part.id !== partId));
    };

    const combinedParts = [
        ...(orderparts || []).map((part: any) => ({
            id: part.id,
            name: part.name, // 🔥 essencial
            sale_price: part.sale_price,
            quantity: part.pivot.quantity,
            source: 'database',
        })),
        ...(partsData || []).map((part: any) => ({
            id: part.id,
            name: part.name,
            sale_price: part.sale_price,
            quantity: part.quantity,
            source: 'local',
        })),
    ];

    const changeModel = (option: OptionType | null) => {
        setSelectedModel(option);
        setData('model', option?.value ?? '');
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
            <InvoiceModal open={openInvoiceModal} onClose={() => setOpenInvoiceModal(false)} order={order} summary={paymentSummary} />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Wrench} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Ordens</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Button variant={'default'} asChild>
                        <Link href={route('app.orders.index', { page: page, search: search })}>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar</span>
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
                    {canManageOrders && (order.service_status === 6 || order.service_status === 7 || order.service_status === 8) && (
                        <Button onClick={() => setOpenInvoiceModal(true)} className="rounded-lg py-2 text-sm font-medium">
                            <FileTextIcon className="h-4 w-4" />
                            Emitir NFSe
                        </Button>
                    )}
                    {canManageOrders && (
                        <OrderPaymentsModal
                            order={order}
                            orderPayments={orderPayments}
                            paymentSummary={paymentSummary}
                            defaultOpen={typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('open_payments') === '1'}
                        />
                    )}
                    <AddPartsModal onSubmit={handleModalSubmit} parts={parts} />
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
                        <div className="bg-background flex flex-col gap-2 rounded-lg p-4 shadow-sm">
                            {/* Número da ordem */}
                            <div className="flex items-center gap-2">
                                <span className="text-foreground text-2xl font-bold tracking-tight">Ordem N° {order.order_number}</span>
                            </div>

                            {/* Datas de criação e atualização */}
                            <div className="text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-6">
                                {/* Data de criação */}
                                <div className="flex items-center gap-1">
                                    <Icon iconNode={Save} className="text-muted-foreground h-4 w-4" />
                                    <span>Criada em: {moment(order.created_at).format('DD/MM/YYYY [às] HH:mm')}</span>
                                </div>

                                {/* Última atualização (aparece somente se houver) */}
                                {order.updated_at && (
                                    <div className="border-muted-foreground/30 flex items-center gap-1 border-l pl-4">
                                        <span>Última atualização: {moment(new Date(order.updated_at)).fromNow()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-8">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="customer_id">Cliente</Label>
                                <Select<OptionType, false>
                                    menuPosition="fixed"
                                    defaultValue={defaultCustomer}
                                    options={optionsCustomer}
                                    onChange={changeCustomer}
                                    placeholder="Selecione o cliente"
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
                                <InputError className="mt-2" message={errors.customer_id} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="equipment">Equipamento</Label>
                                <Select
                                    menuPosition="fixed"
                                    defaultValue={defaultEquipament}
                                    options={optionsEquipment}
                                    onChange={changeEquipment}
                                    placeholder="Selecione o status"
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

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="budget_description">Descrição do orcamento</Label>
                                <Textarea
                                    id="budget_description"
                                    value={data.budget_description}
                                    onChange={(e) => setData('budget_description', e.target.value)}
                                />
                                {errors.budget_description && <div className="text-sm text-red-500">{errors.budget_description}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="budget_value">Valor orçamento</Label>
                                <Input
                                    type="text"
                                    id="budget_value"
                                    value={maskMoney(String(data.budget_value ?? '0'))}
                                    onChange={(e) => setData('budget_value', maskMoneyDot(e.target.value))}
                                />
                                {errors.budget_value && <div className="text-sm text-red-500">{errors.budget_value}</div>}
                            </div>
                        </div>

                        {combinedParts.length > 0 && (
                            <Card className="mb-4">
                                <CardTitle className="border-b px-4 pb-2">Peças adicionadas</CardTitle>

                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {combinedParts.map((part: any, index: number) => {
                                            const unitPrice = toMoneyNumber(part.sale_price);
                                            const total = unitPrice * Number(part.quantity || 0);

                                            return (
                                                <div
                                                    key={`${part.source}-${part.id}-${index}`}
                                                    className="hover:bg-muted/50 flex flex-col gap-3 p-3 transition sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    {/* ESQUERDA */}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{part.name}</span>

                                                        <span className="text-muted-foreground text-xs">
                                                            {maskMoney(String(unitPrice))} × {part.quantity}
                                                        </span>
                                                    </div>

                                                    {/* DIREITA */}
                                                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                                        <span className="text-sm font-semibold">{maskMoney(String(total))}</span>

                                                        {/* Origem */}
                                                        <Badge variant={part.source === 'database' ? 'outline' : 'default'}>
                                                            {part.source === 'database' ? 'Salvo' : 'Novo'}
                                                        </Badge>

                                                        {/* Remover */}
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={(e) =>
                                                                part.source === 'database'
                                                                    ? handleRemovePartsOrder(e, part.id)
                                                                    : handleRemovePart(part.id)
                                                            }
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="parts_value">Valor das peças</Label>
                                <Input
                                    type="text"
                                    id="parts_value"
                                    name="parts_value"
                                    value={maskMoney(data.parts_value ?? 0)}
                                    onChange={(e) => setData('parts_value', maskMoneyDot(e.target.value))}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="service_value">Valor do serviço</Label>
                                <Input
                                    type="text"
                                    id="service_value"
                                    name="service_value"
                                    value={maskMoney(data.service_value ?? '0')}
                                    onChange={(e) => setData('service_value', maskMoneyDot(e.target.value))}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="service_cost">Valor total</Label>
                                <Input
                                    type="text"
                                    id="service_cost"
                                    value={maskMoney(data.service_cost)}
                                    onChange={(e) => setData('service_cost', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="service_status">Técnico responsável</Label>
                                <Select
                                    menuPosition="fixed"
                                    defaultValue={defaultTechnical}
                                    options={optionsTechnical}
                                    onChange={changeResponsibleTechnician}
                                    placeholder="Selecione o técnico"
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
                                            color: '#ebebeb', // cinza escuro (igual input padrão)
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
                                {errors.user_id && <div className="text-sm text-red-500">{errors.user_id}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="service_status">Status orçamento</Label>
                                <Select
                                    menuPosition="fixed"
                                    defaultValue={statusDefault}
                                    options={statusServico}
                                    onChange={changeServiceStatus}
                                    placeholder="Selecione o status"
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
                                            color: '#ebebeb', // cinza escuro (igual input padrão)
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

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="services_performed">Serviços executados</Label>
                                <Textarea
                                    id="services_performed"
                                    value={data.services_performed}
                                    onChange={(e) => setData('services_performed', e.target.value)}
                                />
                                {errors.services_performed && <div className="text-sm text-red-500">{errors.services_performed}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="observations">Observações</Label>
                                <Textarea id="observations" value={data.observations} onChange={(e) => setData('observations', e.target.value)} />
                                {errors.observations && <div className="text-sm text-red-500">{errors.observations}</div>}
                            </div>
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
