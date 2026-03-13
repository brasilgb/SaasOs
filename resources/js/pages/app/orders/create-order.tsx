import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, OptionType } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Save, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { statusOrcamento } from "@/Utils/dataSelect";
import Select from 'react-select';
import InputError from "@/components/input-error";
import { useEffect, useState } from "react";
import { maskMoney, maskMoneyDot } from "@/Utils/mask";
import { toastSuccess } from "@/components/app-toast-messages";
import { DatePicker } from "@/components/date-picker";
import selectStyles from "@/Utils/selectStyles";
import CreatableSelect from "react-select/creatable"

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

export default function CreateOrder({ customers, equipments, models }: any) {
  const initialModelOptions = models.map((model: any) => ({
  value: model,
  label: model,
}))

const [modelOptions, setModelOptions] = useState<OptionType[]>(initialModelOptions)
const [selectedModel, setSelectedModel] = useState<OptionType | null>('')


  const optionsCustomer = customers.map((customer: any) => ({
    value: customer.id,
    label: customer.name,
  }));

  const optionsEquipment = equipments.map((equipment: any) => ({
    value: equipment.id,
    label: equipment.equipment,
  }));

  const { data, setData, post, progress, processing, reset, errors } = useForm({
    customer_id: '',
    equipment_id: '', // equipamento
    model: '',
    password: '',
    defect: '',
    state_conservation: '', //estado de conservação
    accessories: '',
    budget_description: '', // descrição do orçamento
    budget_value: '0.00', // valor do orçamento
    service_status: '1',
    delivery_forecast: '', // previsao de entrega
    observations: '',
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    post(route('app.orders.store'), {
      onSuccess: () => {
        toastSuccess("Sucesso", "Ordem de serviço gerada com sucesso")
        reset()
      },
    });
  }

  useEffect(() => {
    setData('budget_value', maskMoneyDot(data.budget_value));
  }, [data.budget_value]);

  const changeCustomer = (selected: any) => {
    setData('customer_id', selected?.value || '');
  };

  const changeEquipment = (selected: any) => {
    setData('equipment_id', selected?.value);
  };

  const changeServiceStatus = (selected: any) => {
    setData('service_status', selected?.value);
  };

  const handleFocus = () => {
    if (data.budget_value === "0,00") {
      setData("budget_value", "")
    }
  }

  const changeModel = (option: OptionType | null) => {
    setSelectedModel(option)
    setData("model", option?.value ?? "")
  }

  const createModel = (value: string) => {
    const option = { label: value, value }
    setModelOptions(prev => [...prev, option])
    setSelectedModel(option)
    setData("model", value)
  }

  return (
    <AppLayout>
      <Head title="Ordens" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={Wrench} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Ordens</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div>
          <Button variant={'default'} asChild>
            <Link
              href={route('app.orders.index')}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Link>
          </Button>
        </div>

      </div>

      <div className='p-4'>
        <div className='border rounded-lg p-2'>

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
            <div className="grid md:grid-cols-8 gap-4 mt-4">

              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="customer_id">Cliente</Label>
                <Select
                  options={optionsCustomer}
                  onChange={changeCustomer}
                  placeholder="Selecione o cliente"
                  className="shadow-xs p-0 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
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
                      color: "#ebebeb", // cinza escuro (igual input padrão)
                      fontSize: "14px",
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

              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="equipment">Equipamento</Label>
                <Select
                  menuPosition='fixed'
                  options={optionsEquipment}
                  onChange={changeEquipment}
                  placeholder="Selecione o equipamento"
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
                    singleValue: (base) => ({
                      ...base,
                      color: "#ebebeb", // cinza escuro (igual input padrão)
                      fontSize: "14px",
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
                {errors.equipment_id && <div className="text-red-500 text-sm">{errors.equipment_id}</div>}
              </div>

              <div className="md:col-span-2 grid gap-2">
                <Label>Marca e Modelo</Label>
                <CreatableSelect
                  value={selectedModel}
                  options={modelOptions}
                  onChange={changeModel}
                  onCreateOption={createModel}
                  isClearable
                  styles={selectStyles}
                  placeholder="Selecione ou digite a nova"
                  className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
                />
                <InputError message={errors.model} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  type="text"
                  id="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                />
                {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="delivery_forecast">Previsão de entrega</Label>
                <DatePicker
                  mode="single"
                  date={data.delivery_forecast}
                  setDate={(value) => {
                    if (!value) {
                      setData('delivery_forecast', '')
                      return
                    }
                    const d = value as Date
                    const formatted = [
                      d.getFullYear(),
                      String(d.getMonth() + 1).padStart(2, '0'),
                      String(d.getDate()).padStart(2, '0'),
                    ].join('-')

                    setData('delivery_forecast', formatted)
                  }}
                />
              </div>

            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">

              <div className="grid gap-2">
                <Label htmlFor="defect">Defeito relatado</Label>
                <Textarea
                  id="defect"
                  value={data.defect}
                  onChange={(e) => setData('defect', e.target.value)}
                />
                {errors.defect && <div className="text-red-500 text-sm">{errors.defect}</div>}
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
                <Textarea
                  id="accessories"
                  value={data.accessories}
                  onChange={(e) => setData('accessories', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="budget_description">Descrição pré-orcamento</Label>
                <Textarea
                  id="budget_description"
                  value={data.budget_description}
                  onChange={(e) => setData('budget_description', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="budget_value">Valor pré-orçamento</Label>
                <Input
                  type="text"
                  id="budget_value"
                  value={maskMoney(data.budget_value)}
                  onChange={(e) => setData('budget_value', e.target.value)}
                  onFocus={handleFocus}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service_status">Status orçamento</Label>
                <Select
                  menuPosition='fixed'
                  options={statusOrcamento}
                  onChange={changeServiceStatus}
                  placeholder="Selecione o status"
                  defaultValue={[{ value: statusOrcamento[0].value, label: statusOrcamento[0].label }]}
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
                    singleValue: (base) => ({
                      ...base,
                      color: "#ebebeb", // cinza escuro (igual input padrão)
                      fontSize: "14px",
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
              <Textarea
                id="observations"
                value={data.observations}
                onChange={(e) => setData('observations', e.target.value)}
              />
              {errors.observations && <div className="text-red-500 text-sm">{errors.observations}</div>}
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
  )
}
