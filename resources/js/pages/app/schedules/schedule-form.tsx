import { toastSuccess } from '@/components/app-toast-messages';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Customer, Scheduler, User } from '@/types';
import { statusAgenda } from '@/Utils/dataSelect';
import selectStyles from '@/Utils/selectStyles';
import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import Select from 'react-select';

interface ScheduleFormProps {
    initialData?: Scheduler;
    customers: Customer[];
    technicals: User[];
}
export default function ScheduleForm({ customers, initialData, technicals }: ScheduleFormProps) {
    const isEdit = !!initialData;

    const optionsCustomer = customers.map((customer: any) => ({
        value: customer.id,
        label: customer.name,
    }));

    const optionsTechnical = technicals.map((technical: any) => ({
        value: technical.id,
        label: technical.name,
    }));

    const { data, setData, post, patch, progress, processing, reset, errors } = useForm({
        customer_id: initialData?.customer_id ?? '',
        schedules: initialData?.schedules ?? '',
        service: initialData?.service ?? '',
        details: initialData?.details ?? '',
        user_id: initialData?.user_id ?? '',
        status: initialData?.status ?? '',
        observations: initialData?.observations ?? '',
    });

    const changeCustomer = (selected: any) => {
        setData('customer_id', selected?.value || '');
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
        setData('status', selected?.value);
    };

    const changeResponsibleTechnician = (selected: any) => {
        setData('user_id', selected?.value);
    };

    const defaultCustomer = optionsCustomer
        ?.filter((o: any) => o.value == initialData?.customer_id)
        .map((opt: any) => ({ value: opt.value, label: opt.label }));
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
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="customer_id">Cliente</Label>
                    <Select
                        menuPosition="fixed"
                        defaultValue={defaultCustomer}
                        options={optionsCustomer}
                        onChange={changeCustomer}
                        placeholder="Selecione o cliente"
                        className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        styles={selectStyles}
                    />
                    <InputError className="mt-2" message={errors.customer_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="schedules">Horário da visita</Label>
                    <Input type="datetime-local" id="schedules" value={data.schedules} onChange={(e) => setData('schedules', e.target.value)} />
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
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="service_status">Técnico responsável</Label>
                    <Select
                        menuPosition="fixed"
                        defaultValue={defaultTechnical}
                        options={optionsTechnical}
                        onChange={changeResponsibleTechnician}
                        placeholder="Selecione o técnico"
                        className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        styles={selectStyles}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="status">Status do agendamento</Label>
                    <Select
                        menuPosition="fixed"
                        defaultValue={statusDefault}
                        options={statusAgenda}
                        onChange={changeServiceStatus}
                        placeholder="Selecione o status"
                        className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        styles={selectStyles}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea id="observations" value={data.observations} onChange={(e) => setData('observations', e.target.value)} />
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
