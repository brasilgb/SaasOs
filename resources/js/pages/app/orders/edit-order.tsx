import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
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
import { toastSuccess } from "@/components/app-toast-messages";
import { DatePicker } from "@/components/date-picker";

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

  const { ziggy, othersetting } = usePage().props as any;
  const disableParts = !othersetting?.enableparts ? 'parts' : '';
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
        toastSuccess("Sucesso", "Ordem de serviço alterada com sucesso")
        setPartsData([]);
      },
    });
  }

  useEffect(() => {
    if (othersetting?.enableparts) {
      const finalPartsMap = new Map();
      // Adiciona peças do banco de dados
      (orderparts || []).forEach((p: any) => finalPartsMap.set(p.id, { id: p.id, sale_price: p.sale_price, quantity: p.pivot.quantity }));
      // Adiciona/sobrescreve com peças adicionadas localmente
      (partsData || []).forEach((p: any) => finalPartsMap.set(p.id, { id: p.id, sale_price: p.sale_price, quantity: p.quantity }));
      const finalListWithDetails = Array.from(finalPartsMap.values());

      // Prepara o payload para o backend
      const allpartsPayload = finalListWithDetails.map(p => ({ part_id: p.id, quantity: p.quantity }));
      // Calcula o valor total de todas as peças
      const totalValue = finalListWithDetails.reduce((acc, p) => acc + (Number(p.sale_price) * p.quantity), 0);

      // Atualiza o estado do formulário
      setData((currentData: any) => ({
        ...currentData,
        allparts: allpartsPayload,
        parts_value: String(totalValue)
      }));
    }
  }, [partsData, orderparts, othersetting]);

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

  const handleRemovePartsOrder = (e: any, id: number) => {
    e.preventDefault();
    post(route('app.orders.removePart',
      { order_id: order.id, part_id: id }
    ))
    // const calcTotal = 
    setData((data: any) => ({ ...data, parts_value: '0.00' }));
    setData((data: any) => ({ ...data, service_value: '0.00' }));
    setData((data: any) => ({ ...data, service_cost: '0.00' }));
    setData((data: any) => ({ ...data, allparts: [] }));
    setPartsData([]);
  }

  const handleRemovePart = (partId: any) => {
    setPartsData((  currentLocalParts: any) => currentLocalParts.filter((part: any) => part.id !== partId));
  };

  const combinedParts = [
    ...(orderparts || []).map((part: any) => ({
      ...part,
      quantity: part.pivot.quantity,
      source: 'database'
    })),
    ...(partsData || []).map((part: any) => ({
      ...part,
      source: 'local'
    }))
  ];

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
              href={route('app.orders.index', { page: page, oc: oc })}
            >
              <ArrowLeft h-4 w-4 />
              <span>Voltar</span>
            </Link>
          </Button>
        </div>
        <div>
          {!disableParts &&
            <AddPartsModal onSubmit={handleModalSubmit} parts={parts} />}
        </div>
      </div>

      <div className='p-4'>
        <div className='border rounded-lg p-2'>

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
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

            {combinedParts.length > 0 && othersetting?.enableparts > 0 &&
              <Card className="p-4 mb-4">
                <CardTitle className="border-b pb-2">Peças adicionadas</CardTitle>
                <CardContent className="flex items-center justify-start gap-4 flex-wrap">
                  {combinedParts.map((part: any, index: number) => (
                    <div key={`${part.source}-${part.id}-${index}`} className="flex items-center gap-2">
                      <Badge variant={'secondary'} className="text-sm gap-2">
                        <span>{part.name}(x{part.quantity}) - {maskMoney(String(Number(part.sale_price)))} = {maskMoney(String(Number(part.sale_price) * Number(part.quantity)))}</span>
                        <Button type="button" variant={'destructive'} onClick={(e) => part.source === 'database' ? handleRemovePartsOrder(e, part.id) : handleRemovePart(part.id)} >
                          <X />
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

              {othersetting?.enableparts > 0 &&
                <div className="grid gap-2">
                  <Label htmlFor="parts_value">Valor das peças</Label>
                  <Input
                    type="text"
                    id="parts_value"
                    value={maskMoney(data.parts_value)}
                    onChange={(e) => setData('parts_value', e.target.value)}
                    required
                  />
                </div>
              }

              <div className="grid gap-2">
                <Label htmlFor="service_value">Valor do serviço</Label>
                <Input
                  type="text"
                  id="service_value"
                  value={maskMoney(data.service_value)}
                  onChange={(e) => setData('service_value', e.target.value)}
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
                {errors.responsible_technician && <div className="text-red-500 text-sm">{errors.responsible_technician}</div>}
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
