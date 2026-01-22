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
}

export default function BudgetForm({ initialData, budgets }: BudgetFormProps) {
  const isEdit = !!initialData
  const initialCategoryOptions: OptionType[] = budgets?.map((bud: any) => ({
    value: bud,
    label: bud,
  }));
  /* =========================
     FORM STATE (INERTIA)
  ========================= */
  const { data, setData, post, patch, processing, reset, errors } = useForm({
    category: initialData?.category ?? "",
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
  const [categoryOptions, setCategoryOptions] =
    useState<OptionType[]>(initialCategoryOptions)

  const defaultCategory =
    categoryOptions.find(o => o.value === initialData?.category) ?? null

  const defaultWarranty =
    warrantyOptions.find(o => o.value === initialData?.warranty) ?? null

  const [selectedCategory, setSelectedCategory] =
    useState<OptionType | null>(defaultCategory)

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
          setSelectedCategory(null)
          setSelectedWarranty(null)
        },
      })
    }
  }

  /* =========================
     SELECT HANDLERS
  ========================= */
  const changeCategory = (option: OptionType | null) => {
    setSelectedCategory(option)
    setData("category", option?.value ?? "")
  }

  const createCategory = (value: string) => {
    const option = { label: value, value }
    setCategoryOptions(prev => [...prev, option])
    setSelectedCategory(option)
    setData("category", value)
  }

  const changeWarranty = (option: OptionType | null) => {
    setSelectedWarranty(option)
    setData("warranty", option?.value ?? "")
  }

  const textareaClass =
    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Linha 1 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>Categoria do Orçamento</Label>
          <CreatableSelect
            value={selectedCategory}
            options={categoryOptions}
            onChange={changeCategory}
            onCreateOption={createCategory}
            isClearable
            styles={selectStyles}
            placeholder="Selecione ou digite a nova"
            className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
          />
          <InputError message={errors.category} />
        </div>

        <div className="grid gap-2">
          <Label>Serviço</Label>
          <Input value={data.service} onChange={e => setData("service", e.target.value)} />
          <InputError message={errors.service} />
        </div>

        <div className="grid gap-2">
          <Label>Modelo</Label>
          <Input value={data.model} onChange={e => setData("model", e.target.value)} />
        </div>
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
          <Label>Descrição</Label>
          <textarea className={textareaClass} value={data.description} onChange={e => setData("description", e.target.value)} />
          <InputError message={errors.description} />
        </div>

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
