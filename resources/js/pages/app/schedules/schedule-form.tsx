import { toastSuccess } from '@/components/app-toast-messages';
import { DateTimePicker } from '@/components/date-time-picker';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Customer, Scheduler, User } from '@/types';
import { statusAgenda } from '@/Utils/dataSelect';
import selectStyles from '@/Utils/selectStyles';
import { useForm } from '@inertiajs/react';
import { Camera, CheckCircle2, ClipboardCheck, CreditCard, FileText, Save, Smartphone, XCircle } from 'lucide-react';
import Select from 'react-select';

interface ScheduleFormProps {
    initialData?: Scheduler;
    customers: Customer[];
    orders: any[];
    technicals: User[];
    enableTechnicianScheduleNotifications: boolean;
}

function formatCurrency(value: any) {
    const amount = Number(value || 0);

    return amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function getMobileStage(summary: any) {
    if (!summary?.sent_to_technician) {
        return { label: 'Não enviado ao técnico', className: 'border-muted-foreground/30 text-muted-foreground' };
    }

    if (summary.has_check_out) {
        return { label: 'Finalizado no app', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
    }

    if (summary.has_check_in) {
        return { label: 'Em atendimento', className: 'border-sky-200 bg-sky-50 text-sky-700' };
    }

    return { label: 'Enviado ao técnico', className: 'border-amber-200 bg-amber-50 text-amber-700' };
}

function TechnicianAttendancePanel({ schedule }: { schedule: any }) {
    const summary = schedule?.mobile_summary;
    const order = schedule?.order;
    const stage = getMobileStage(summary);
    const checklistItems = summary?.checklist_items || [];
    const completedItems = summary?.checklist_completed_items || [];

    return (
        <Card id="technician-report">
            <CardTitle className="border-b px-6 pb-4">Atendimento técnico</CardTitle>
            <CardContent className="space-y-5 pt-6">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={stage.className}>
                        <Smartphone className="h-3 w-3" />
                        {stage.label}
                    </Badge>
                    <Badge variant="outline" className={summary?.has_report ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : ''}>
                        <FileText className="h-3 w-3" />
                        {summary?.has_report ? 'Relatório preenchido' : 'Relatório pendente'}
                    </Badge>
                    <Badge
                        variant="outline"
                        className={
                            summary?.has_checklist
                                ? summary?.checklist_completed
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-amber-200 bg-amber-50 text-amber-700'
                                : ''
                        }
                    >
                        <ClipboardCheck className="h-3 w-3" />
                        {summary?.has_checklist ? (summary?.checklist_completed ? 'Checklist concluído' : 'Checklist pendente') : 'Sem checklist'}
                    </Badge>
                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                        <Camera className="h-3 w-3" />
                        {summary?.images_count || 0} foto{Number(summary?.images_count || 0) === 1 ? '' : 's'}
                    </Badge>
                    {summary?.local_payment_received && (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            <CreditCard className="h-3 w-3" />
                            Pagamento local
                        </Badge>
                    )}
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-md border p-3">
                        <div className="text-muted-foreground text-xs">Check-in</div>
                        <div className="mt-1 font-medium">{summary?.has_check_in ? 'Realizado' : 'Pendente'}</div>
                    </div>
                    <div className="rounded-md border p-3">
                        <div className="text-muted-foreground text-xs">Check-out</div>
                        <div className="mt-1 font-medium">{summary?.has_check_out ? 'Realizado' : 'Pendente'}</div>
                    </div>
                    <div className="rounded-md border p-3">
                        <div className="text-muted-foreground text-xs">Fotos anexadas</div>
                        <div className="mt-1 font-medium">{summary?.images_count || 0}</div>
                    </div>
                    <div className="rounded-md border p-3">
                        <div className="text-muted-foreground text-xs">Pagamentos na OS</div>
                        <div className="mt-1 font-medium">{summary?.payments_count || 0}</div>
                    </div>
                </div>

                {(order?.technician_diagnosis || order?.technician_solution || order?.technician_observations) && (
                    <div className="grid gap-3 lg:grid-cols-3">
                        <div className="rounded-md border p-3">
                            <div className="text-muted-foreground text-xs">Diagnóstico</div>
                            <div className="mt-2 whitespace-pre-wrap text-sm">{order?.technician_diagnosis || 'Não informado'}</div>
                        </div>
                        <div className="rounded-md border p-3">
                            <div className="text-muted-foreground text-xs">Solução aplicada</div>
                            <div className="mt-2 whitespace-pre-wrap text-sm">{order?.technician_solution || 'Não informado'}</div>
                        </div>
                        <div className="rounded-md border p-3">
                            <div className="text-muted-foreground text-xs">Observações do técnico</div>
                            <div className="mt-2 whitespace-pre-wrap text-sm">{order?.technician_observations || 'Não informado'}</div>
                        </div>
                    </div>
                )}

                {checklistItems.length > 0 && (
                    <div className="rounded-md border p-3">
                        <div className="text-muted-foreground mb-3 text-xs">Checklist do equipamento</div>
                        <div className="grid gap-2 md:grid-cols-2">
                            {checklistItems.map((item: string) => {
                                const isDone = completedItems.includes(item);

                                return (
                                    <div key={item} className="flex items-start gap-2 text-sm">
                                        {isDone ? (
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                                        ) : (
                                            <XCircle className="mt-0.5 h-4 w-4 text-amber-600" />
                                        )}
                                        <span>{item}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {summary?.local_payment_received && (
                    <div className="rounded-md border p-3">
                        <div className="text-muted-foreground text-xs">Pagamento recebido pelo técnico</div>
                        <div className="mt-2 grid gap-2 text-sm md:grid-cols-3">
                            <div>
                                <span className="text-muted-foreground">Valor: </span>
                                <span className="font-medium">{formatCurrency(order?.technician_local_payment_amount)}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Método: </span>
                                <span className="font-medium">{order?.technician_local_payment_method || 'Não informado'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Rota: </span>
                                <span className="font-medium">{summary?.sent_to_technician ? 'Disponível no app' : 'Não enviada'}</span>
                            </div>
                        </div>
                        {order?.technician_local_payment_notes && (
                            <div className="text-muted-foreground mt-2 text-sm">{order.technician_local_payment_notes}</div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function ScheduleForm({ customers, orders, initialData, technicals, enableTechnicianScheduleNotifications }: ScheduleFormProps) {
    const isEdit = !!initialData;

    const optionsCustomer = customers.map((customer: any) => ({
        value: customer.id,
        label: customer.name,
    }));

    const orderOptions = orders.map((order: any) => ({
        value: order.id,
        customer_id: order.customer_id,
        label: `OS #${order.order_number}${order.model ? ` - ${order.model}` : ''}${order.defect ? ` - ${order.defect}` : ''}`,
    }));

    const optionsTechnical = technicals.map((technical: any) => ({
        value: technical.id,
        label: technical.name,
    }));

    const { data, setData, post, patch, processing, reset, errors } = useForm({
        customer_id: initialData?.customer_id ?? '',
        order_id: initialData?.order_id ?? '',
        schedules: initialData?.schedules ?? '',
        service: initialData?.service ?? '',
        details: initialData?.details ?? '',
        user_id: initialData?.user_id ?? '',
        status: initialData?.status ?? '',
        observations: initialData?.observations ?? '',
        send_to_technician: enableTechnicianScheduleNotifications ? (initialData?.send_to_technician ?? false) : false,
    });

    const changeCustomer = (selected: any) => {
        setData('customer_id', selected?.value || '');
        setData('order_id', '');
    };

    const changeOrder = (selected: any) => {
        setData('order_id', selected?.value || '');
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('app.schedules.update', initialData!.id), {
                onSuccess: () => {
                    toastSuccess('Sucesso', 'Agendamento atualizado com sucesso');
                },
            });
        } else {
            post(route('app.schedules.store'), {
                onSuccess: () => {
                    toastSuccess('Sucesso', 'Agendamento criado com sucesso');
                    reset();
                },
            });
        }
    };

    const changeServiceStatus = (selected: any) => {
        setData('status', selected?.value ?? '');
    };

    const changeResponsibleTechnician = (selected: any) => {
        setData('user_id', selected?.value ?? '');
    };

    const defaultCustomer = optionsCustomer
        ?.filter((o: any) => o.value == initialData?.customer_id)
        .map((opt: any) => ({ value: opt.value, label: opt.label }));
    const filteredOrderOptions = orderOptions.filter((order: any) => order.customer_id == data.customer_id);
    const defaultOrder = orderOptions.find((order: any) => order.value == data.order_id) ?? null;
    const statusDefault = statusAgenda
        ?.filter((o: any) => o.value == initialData?.status)
        .map((opt: any) => ({ value: opt.value, label: opt.label }));
    const defaultTechnical = optionsTechnical
        ?.filter((o: any) => o.value == initialData?.user_id)
        .map((opt: any) => ({ value: opt.value, label: opt.label }));

    return (
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
            <Card>
                <CardTitle className="border-b px-6 pb-4">Agendamento</CardTitle>
                <CardContent className="pt-6">
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="grid gap-2">
                    <Label htmlFor="customer_id">Cliente</Label>
                    <Select
                        menuPosition="fixed"
                        defaultValue={defaultCustomer}
                        options={optionsCustomer}
                        onChange={changeCustomer}
                        placeholder="Selecione o cliente"
                        className="min-w-0"
                        styles={selectStyles}
                    />
                    <InputError className="mt-2" message={errors.customer_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="order_id">Ordem de serviço</Label>
                    <Select
                        key={`order-${data.customer_id}-${data.order_id}`}
                        menuPosition="fixed"
                        value={defaultOrder}
                        options={filteredOrderOptions}
                        onChange={changeOrder}
                        placeholder={data.customer_id ? 'Selecione a ordem de serviço' : 'Selecione o cliente primeiro'}
                        isDisabled={!data.customer_id}
                        className="min-w-0"
                        styles={selectStyles}
                    />
                    <InputError className="mt-2" message={errors.order_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="schedules">Horário da visita</Label>
                    <DateTimePicker id="schedules" value={data.schedules} onChange={(value) => setData('schedules', value)} />
                    <InputError className="mt-2" message={errors.schedules} />
                </div>
            </div>
                </CardContent>
            </Card>

            <Card>
                <CardTitle className="border-b px-6 pb-4">Serviço</CardTitle>
                <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="service">Serviços Requisitados</Label>
                    <Textarea id="service" value={data.service} onChange={(e) => setData('service', e.target.value)} />
                    {errors.service && <div className="text-sm text-red-500">{errors.service}</div>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="details">Detalhes do Serviço</Label>
                    <Textarea id="details" value={data.details} onChange={(e) => setData('details', e.target.value)} />
                    {errors.details && <div className="text-sm text-red-500">{errors.details}</div>}
                </div>
            </div>
                </CardContent>
            </Card>

            <Card>
                <CardTitle className="border-b px-6 pb-4">Acompanhamento</CardTitle>
                <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="grid gap-2">
                    <Label htmlFor="service_status">Técnico responsável</Label>
                    <Select
                        menuPosition="fixed"
                        defaultValue={defaultTechnical}
                        options={optionsTechnical}
                        onChange={changeResponsibleTechnician}
                        placeholder="Selecione o técnico"
                        className="min-w-0"
                        styles={selectStyles}
                    />
                    <InputError className="mt-2" message={errors.user_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="status">Status do agendamento</Label>
                    <Select
                        menuPosition="fixed"
                        defaultValue={statusDefault}
                        options={statusAgenda}
                        onChange={changeServiceStatus}
                        placeholder="Selecione o status"
                        className="min-w-0"
                        styles={selectStyles}
                    />
                    <InputError className="mt-2" message={errors.status} />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-md border px-4 py-3 lg:mt-6">
                    <Label htmlFor="send_to_technician">Enviar ao técnico</Label>
                    <Switch
                        id="send_to_technician"
                        checked={Boolean(data.send_to_technician)}
                        disabled={!enableTechnicianScheduleNotifications}
                        onCheckedChange={(checked) => setData('send_to_technician', checked)}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea id="observations" value={data.observations} onChange={(e) => setData('observations', e.target.value)} />
            </div>
                </CardContent>
            </Card>

            {isEdit && <TechnicianAttendancePanel schedule={initialData} />}

            <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                    <Save />
                    Salvar
                </Button>
            </div>
        </form>
    );
}
