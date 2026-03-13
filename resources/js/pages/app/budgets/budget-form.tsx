import { Button } from "@/components/ui/button"
import { Budget, OptionType } from "@/types"
import { useForm } from "@inertiajs/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CreatableSelect from "react-select/creatable"
import Select from "react-select"
import InputError from "@/components/input-error"
import { useEffect, useState } from "react"
import { maskMoney, maskMoneyDot, unMask } from "@/Utils/mask"
import { warrantyOptions } from "@/Utils/dataSelect"
import { Save } from "lucide-react"
import { toastSuccess } from "@/components/app-toast-messages"
import selectStyles from "@/Utils/selectStyles"

interface BudgetFormProps {
  initialData?: Budget;
  budgets: Budget[];
  equipments: any;
}

export default function BudgetForm({ initialData, budgets, equipments }: BudgetFormProps) {
  const isEdit = !!initialData

  const initialModelOptions: OptionType[] = budgets?.map((bud: any) => ({
    value: bud,
    label: bud,
  }));

  const optionsEquipment = equipments?.map((equipment: any) => ({
    value: equipment.id,
    label: equipment.equipment,
  }));

  /* =========================
     FORM STATE (INERTIA)
  ========================= */
  const { data, setData, post, patch, processing, reset, errors } = useForm({
    equipment_id: initialData?.equipment_id ?? "",
    service: initialData?.service ?? "",
    model: initialData?.model ?? "",
    description: initialData?.description ?? "",
    estimated_time: initialData?.estimated_time ?? "",
    part_value: initialData?.part_value ?? "",
    labor_value: initialData?.labor_value ?? "",
    total_value: initialData?.total_value ?? "",
    warranty: initialData?.warranty ?? "",
    validity: initialData?.validity ?? "",
    obs: initialData?.obs ?? "",
  })

  /* =========================
     SELECT OPTIONS
  ========================= */
  const [modelOptions, setModelOptions] =
    useState<OptionType[]>(initialModelOptions)

  const defaultModel =
    modelOptions.find(o => o.value === initialData?.model) ?? null

  const defaultWarranty =
    warrantyOptions.find(o => o.value === initialData?.warranty) ?? null
  const defaultEquipament =
    optionsEquipment?.filter((o: any) => o.value == initialData?.equipment_id).map((opt: any) => ({ value: opt.value, label: opt.label }));

  const [selectedModel, setSelectedModel] =
    useState<OptionType | null>(defaultModel)

  const [selectedWarranty, setSelectedWarranty] =
    useState<OptionType | null>(defaultWarranty)

  useEffect(() => {
    const part = Number(unMask(String(data.part_value))) || 0
    const labor = Number(unMask(String(data.labor_value))) || 0
    const total = part + labor

    setData((data: any) => ({
      ...data,
      part_value: maskMoneyDot(data.part_value),
      labor_value: maskMoneyDot(data.labor_value),
      total_value: maskMoneyDot(String(total)),
    }));
  }, [data.part_value, data.labor_value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isEdit) {
      patch(route("app.budgets.update", initialData!.id), {
        onSuccess: () => {
          toastSuccess("Sucesso", "Orçamento atualizado com sucesso")
        },
      })
    } else {
      post(route("app.budgets.store"), {
        onSuccess: () => {
          toastSuccess("Sucesso", "Orçamento criado com sucesso")
          reset()
          setSelectedModel(null)
          setSelectedWarranty(null)
        },
      })
    }
  }

  /* =========================
     SELECT HANDLERS
  ========================= */
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

  const changeWarranty = (option: OptionType | null) => {
    setSelectedWarranty(option)
    setData("warranty", option?.value ?? "")
  }

  const changeEquipment = (selected: any) => {
    setData('equipment_id', selected?.value);
  };

  const textareaClass =
    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Linha 1 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="equipment">Equipamento</Label>
          <Select
            menuPosition='fixed'
            defaultValue={defaultEquipament}
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

        <div className="grid gap-2">
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
          <Label>Serviço</Label>
          <Input value={data.service} onChange={e => setData("service", e.target.value)} />
          <InputError message={errors.service} />
        </div>

      </div>

      <div className="grid gap-2">
        <Label>Descrição</Label>
        <textarea className={textareaClass} value={data.description} onChange={e => setData("description", e.target.value)} />
        <InputError message={errors.description} />
      </div>

      {/* Linha 2 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>Valor Peças</Label>
          <Input value={maskMoney(data.part_value)} onChange={e => setData("part_value", e.target.value)} />
        </div>

        <div className="grid gap-2">
          <Label>Tempo Estimado do Serviço (Hs)</Label>
          <Input value={data.estimated_time} onChange={e => setData("estimated_time", e.target.value)} />
          <InputError message={errors.estimated_time} />
        </div>

        <div className="grid gap-2">
          <Label>Garantia</Label>
          <Select
            value={selectedWarranty}
            options={warrantyOptions}
            onChange={changeWarranty}
            isClearable
            styles={selectStyles}
            placeholder="Selecione ou defina a garantia"
            className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
          />
          <InputError message={errors.warranty} />
        </div>
      </div>

      {/* Linha 3 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>Mão de Obra</Label>
          <Input value={maskMoney(String(data.labor_value))} onChange={e => setData("labor_value", e.target.value)} />
          <InputError message={errors.labor_value} />
        </div>

        <div className="grid gap-2">
          <Label>Total</Label>
          <Input value={maskMoney(String(data.total_value))} onChange={e => setData("total_value", e.target.value)} />
          <InputError message={errors.total_value} />
        </div>

        <div className="grid gap-2">
          <Label>Validade do orçamento(dias)</Label>
          <Input value={maskMoney(String(data.validity))} onChange={e => setData("validity", e.target.value)} />
          <InputError message={errors.validity} />
        </div>
      </div>

      {/* Textareas */}
      <div className="grid gap-4">

        <div className="grid gap-2">
          <Label>Observações</Label>
          <textarea className={textareaClass} value={data.obs} onChange={e => setData("obs", e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={processing}>
          <Save className="mr-2" />
          {isEdit ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
