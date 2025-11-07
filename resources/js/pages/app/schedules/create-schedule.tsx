import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Calendar, Save } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { maskCep, maskPhone } from "@/Utils/mask";
import Select from 'react-select';
import InputError from "@/components/input-error";
import { statusAgenda } from "@/Utils/dataSelect";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Agendamentos',
    href: route('app.schedules.index'),
  },
  {
    title: 'Adicionar',
    href: '#',
  },
];

export default function CreateSchedule({ customers, technicals }: any) {
  const { flash } = usePage().props as any;

  const optionsCustomer = customers.map((customer: any) => ({
    value: customer.id,
    label: customer.name,
  }));

  const optionsTechnical = technicals.map((technical: any) => ({
    value: technical.id,
    label: technical.name,
  }));

  const { data, setData, post, progress, processing, reset, errors } = useForm({
    customer_id: '',
    schedules: '',
    service: '',
    details: '',
    user_id: '',
    status: '',
    observations: ''
  });

  const changeCustomer = (selected: any) => {
    setData('customer_id', selected?.value || '');
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    post(route('app.schedules.store'), {
      onSuccess: () => reset(),
    });
  }

  const changeServiceStatus = (selected: any) => {
    setData('status', selected?.value);
  };

  const changeResponsibleTechnician = (selected: any) => {
    setData('user_id', selected?.value);
  };

  return (
    <AppLayout>
      <Head title="Agendamentos" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={Calendar} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Agendamentos</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div>
          <Button variant={'default'} asChild>
            <Link
              href={route('app.schedules.index')}
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
            <div className="grid md:grid-cols-2 gap-4 mt-4">

              <div className=" grid gap-2">
                <Label htmlFor="customer_id">Cliente</Label>
                <Select
                  options={optionsCustomer}
                  onChange={changeCustomer}
                  placeholder="Selecione o cliente"
                  className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      fontSize: '14px',
                      boxShadow: 'none',
                      border: 'none',
                      background: 'transparent',
                      paddingBottom: '2px',
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

              <div className="grid gap-2">
                <Label htmlFor="schedules">Horário da visita</Label>
                <Input
                  type="datetime-local"
                  id="schedules"
                  value={data.schedules}
                  onChange={(e) => setData('schedules', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="service">Serviços Requisitados</Label>
                <Textarea
                  id="service"
                  value={data.service}
                  onChange={(e) => setData('service', e.target.value)}
                />
                {errors.service && <div className="text-red-500 text-sm">{errors.service}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="details">Detalhes do Serviço</Label>
                <Textarea
                  id="details"
                  value={data.details}
                  onChange={(e) => setData('details', e.target.value)}
                />
                {errors.details && <div className="text-red-500 text-sm">{errors.details}</div>}
              </div>

            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">

              <div className="grid gap-2">
                <Label htmlFor="user_id">Técnico responsável</Label>
                <Select
                  menuPosition='fixed'
                  // defaultValue={defaultTechnical}
                  options={optionsTechnical}
                  onChange={changeResponsibleTechnician}
                  placeholder="Selecione o técnico"
                  className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      fontSize: '14px',
                      boxShadow: 'none',
                      border: 'none',
                      background: 'transparent',
                      paddingBottom: '2px',
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
                {errors.user_id && <div className="text-red-500 text-sm">{errors.user_id}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status do agendamento</Label>
                <Select
                  menuPosition='fixed'
                  options={statusAgenda}
                  onChange={changeServiceStatus}
                  placeholder="Selecione o status"
                  className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      fontSize: '14px',
                      boxShadow: 'none',
                      border: 'none',
                      background: 'transparent',
                      paddingBottom: '2px',
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
                {errors.status && <div className="text-red-500 text-sm">{errors.status}</div>}
              </div>

            </div>

            <div className="grid gap-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={data.observations}
                onChange={(e) => setData('observations', e.target.value)}
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
      </div >
    </AppLayout >
  )
}
