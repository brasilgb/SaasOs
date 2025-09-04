import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Save, Wrench, X } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { statusServico } from "@/Utils/dataSelect";
import Select from 'react-select';
import InputError from "@/components/input-error";
import AlertSuccess from "@/components/app-alert-success";
import { useEffect, useState } from "react";
import { maskMoney, maskMoneyDot } from "@/Utils/mask";
import moment from "moment";
import AddPartsModal from "./add-parts";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function EditOrder({ customers, order, technicals, equipments, parts, orderparts }: any) {
  const { flash, ziggy, othersetting } = usePage().props as any;
  const { page, oc } = (ziggy as any).query

  const [partsData, setPartsData] = useState<any>([]);

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
    model: order?.model,
    password: order?.password,
    defect: order?.defect,
    state_conservation: order?.state_conservation, //estado de conservação
    accessories: order?.accessories,
    budget_description: order?.budget_description, // descrição do orçamento
    budget_value: order?.budget_value, // valor do orçamento
    services_performed: order.services_performed, // servicos executados
    parts: order.parts,
    parts_value: order.parts_value,
    service_value: order.service_value,
    service_cost: order.service_cost, // custo
    delivery_date: order.delivery_date, // data de entrega
    responsible_technician: order.responsible_technician,
    service_status: order?.service_status,
    delivery_forecast: order?.delivery_forecast, // previsao de entrega
    observations: order?.observations,
    allparts: '',
  });

  const handleModalSubmit = (data: any) => {
    // const parts = data.map((part: any) => (` ${part.name}(x${part.quantity})`));
    // setData('parts', (parts).toString().trim());
    const partsTotal = data.reduce((acc: any, item: any) => acc + Number(item.sale_price * item.quantity), 0);
    setData('parts_value', partsTotal.toFixed(2));
    setData('allparts', data);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    patch(route('app.orders.update', order.id));
  }

  useEffect(() => {
    setData((data: any) => ({ ...data, budget_value: maskMoneyDot(data?.budget_value) }));
    setData((data: any) => ({ ...data, parts_value: maskMoneyDot(data?.parts_value) }));
    setData((data: any) => ({ ...data, service_value: maskMoneyDot(data?.service_value) }));
    const serviceCost = parseFloat(data?.parts_value) + parseFloat(data?.service_value);
    setData((data: any) => ({ ...data, service_cost: serviceCost.toFixed(2) }));
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
    setData('responsible_technician', selected?.value);
  };

  const defaultCustomer = optionsCustomer?.filter((o: any) => o.value == order?.customer_id).map((opt: any) => ({ value: opt.value, label: opt.label }));
  const defaultEquipament = optionsEquipment?.filter((o: any) => o.value == order?.equipment_id).map((opt: any) => ({ value: opt.value, label: opt.label }));
  const statusDefault = statusServico?.filter((o: any) => o.value == order?.service_status).map((opt: any) => ({ value: opt.value, label: opt.label }));
  const defaultTechnical = optionsTechnical?.filter((o: any) => o.value == order?.responsible_technician).map((opt: any) => ({ value: opt.value, label: opt.label }));

  const handlePartsDelete = (id: number) => {
    // route('app.orders.removePart')} method="post" data={{ order_id: order.id, part_id: part.id }}
    post(route('app.orders.removePart'), { order_id: order.id, part_id: id } as any);
  }

  return (
    <AppLayout>
      {flash.message && <AlertSuccess message={flash.message} />}
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
              href={route('app.orders.index', { page: page, oc: oc })}
            >
              <ArrowLeft h-4 w-4 />
              <span>Voltar</span>
            </Link>
          </Button>
        </div>
        <div>
          {othersetting.enableparts &&
            <AddPartsModal onSubmit={handleModalSubmit} parts={parts} />}
        </div>
      </div>

      <div className='p-4'>
        <div className='border rounded-lg p-2'>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-8 gap-4 mt-4">

              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="customer_id">Cliente</Label>
                <Select
                  menuPosition='fixed'
                  defaultValue={defaultCustomer}
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

              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="equipment">Equipamento</Label>
                <Select
                  menuPosition='fixed'
                  defaultValue={defaultEquipament}
                  options={optionsEquipment}
                  onChange={changeEquipment}
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
                {errors.equipment_id && <div className="text-red-500 text-sm">{errors.equipment_id}</div>}
              </div>

              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  type="text"
                  id="model"
                  value={data.model}
                  onChange={(e) => setData('model', e.target.value)}
                />
                {errors.model && <div className="text-red-500 text-sm">{errors.model}</div>}
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
                <Input
                  type="date"
                  id="delivery_forecast"
                  value={data.delivery_forecast}
                  onChange={(e) => setData('delivery_forecast', e.target.value)}
                />
                {errors.delivery_forecast && <div className="text-red-500 text-sm">{errors.delivery_forecast}</div>}
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

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="budget_description">Descrição do orcamento</Label>
                <Textarea
                  id="budget_description"
                  value={data.budget_description}
                  onChange={(e) => setData('budget_description', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="budget_value">Valor orçamento</Label>
                <Input
                  type="text"
                  id="budget_value"
                  value={maskMoney(data.budget_value.toString())}
                  onChange={(e) => setData('budget_value', e.target.value)}
                />
              </div>
            </div>
            {orderparts?.length > 0 && othersetting?.enableparts > 0 &&
              <Card className="p-4 mb-4">
                <CardTitle className="border-b pb-2">Peças adicionadas</CardTitle>
                <CardContent className="flex items-center justify-start gap-4">
                  {orderparts.map((part: any) => (
                    <div key={part.id} className="flex items-center gap-2">
                      <Badge variant={'secondary'} className="text-sm gap-2">
                        <span>{part.name}(x{part.quantity}) - {part.sale_price} = {maskMoney((parseFloat(part.sale_price) * parseInt(part.quantity)).toFixed(2))}</span>
                        <Button variant={'destructive'} asChild>
                          <Link href={''} onClick={() => handlePartsDelete(part.id)}>
                            <X />
                          </Link>
                        </Button>
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            }
            <div className={`grid ${othersetting?.enableparts ? 'md:grid-cols-3' : 'md:grid-cols-5'} gap-4 mt-4`}>

              {!othersetting?.enableparts &&
                <>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="parts">Peças adicionadas</Label>
                    <Input
                      type="text"
                      id="parts"
                      value={data.parts}
                      onChange={(e) => setData('parts', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="parts_value">Valor das peças</Label>
                    <Input
                      type="text"
                      id="parts_value"
                      value={maskMoney(data.parts_value.toString())}
                      onChange={(e) => setData('parts_value', e.target.value)}
                    />
                  </div>
                </>
              }

              {othersetting?.enableparts &&
                <div className="grid gap-2">
                  <Label htmlFor="parts_value">Valor das peças</Label>
                  <Input
                    type="text"
                    id="parts_value"
                    value={maskMoney(data.parts_value)}
                    onChange={(e) => setData('parts_value', e.target.value)}
                  />
                </div>
              }

              <div className="grid gap-2">
                <Label htmlFor="service_value">Valor do serviço</Label>
                <Input
                  type="text"
                  id="service_value"
                  value={maskMoney(data.service_value.toString())}
                  onChange={(e) => setData('service_value', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service_cost">Valor total</Label>
                <Input
                  type="text"
                  id="service_cost"
                  value={maskMoney(data.service_cost.toString())}
                  onChange={(e) => setData('service_cost', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="service_status">Técnico responsável</Label>
                <Select
                  menuPosition='fixed'
                  defaultValue={defaultTechnical}
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
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service_status">Status orçamento</Label>
                <Select
                  menuPosition='fixed'
                  defaultValue={statusDefault}
                  options={statusServico}
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
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="services_performed">Serviços executados</Label>
                <Textarea
                  id="services_performed"
                  value={data.services_performed}
                  onChange={(e) => setData('services_performed', e.target.value)}
                />
                {errors.services_performed && <div className="text-red-500 text-sm">{errors.services_performed}</div>}
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
