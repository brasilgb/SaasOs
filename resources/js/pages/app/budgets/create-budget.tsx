import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, PackagePlus, Save } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import CreatableSelect from 'react-select/creatable';
import InputError from "@/components/input-error";
import { useEffect, useState } from "react";
import { maskMoney, unMask } from "@/Utils/mask";

// Definição de tipo para as opções
interface OptionType {
  value: string;
  label: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Orçamentos',
    href: route('app.budgets.index'),
  },
  {
    title: 'Adicionar',
    href: route('app.budgets.create'),
  },
];

// Opções de Exemplo para o campo "Garantia"
const initialWarrantyOptions: OptionType[] = [
  { value: '1 meses', label: '1 mês' },
  { value: '3 meses', label: '3 meses' },
  { value: '6 meses', label: '6 meses' },
  { value: '1 ano', label: '1 ano' },
];


export default function CreateBudget({ budgets }: any) {
  const { flash, auth } = usePage().props as any;

  // --- Lógica para o Select 'Category' (Criação/Seleção) ---
  const initialCategoryOptions: OptionType[] = budgets.map((budget: any) => ({
    value: budget,
    label: budget,
  }));

  const [categoryOptions, setCategoryOptions] = useState<OptionType[]>(initialCategoryOptions);
  const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(null);

  // --- Lógica para o Select 'Warranty' (Criação/Seleção) ---
  const [warrantyOptions, setWarrantyOptions] = useState<OptionType[]>(initialWarrantyOptions);
  const [selectedWarranty, setSelectedWarranty] = useState<OptionType | null>(null);


  const { data, setData, post, progress, processing, reset, errors } = useForm({
    'category': '',
    'service': '',
    'model': '',
    'description': '', // Campo TextArea
    'estimated_time': '',
    'part_value': '',
    'labor_value': '',
    'total_value': '',
    'warranty': '', // Campo Select
    'obs': '', // Campo TextArea
  });

  useEffect(() => {
    setData((data: any) => ({
      ...data,
      part_value: unMask(data.part_value),
      labor_value: unMask(data.labor_value),
      total_value: unMask(data.total_value),
    }));
  }, [data.part_value, data.labor_value, data.total_value]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    post(route('app.budgets.store'), {
      onSuccess: () => reset(),
    });
  }

  // --- Handlers para Category ---
  const changeCategory = (selected: OptionType | null) => {
    setSelectedCategory(selected);
    setData('category', selected ? selected.value : '');
  };

  const handleCreateCategory = (inputValue: string) => {
    const newOption: OptionType = {
      label: inputValue,
      value: inputValue,
    };

    setCategoryOptions((prevOptions) => [...prevOptions, newOption]);
    setSelectedCategory(newOption);
    setData('category', newOption.value);
  };

  // --- Handlers para Warranty (Select Adicional) ---
  const changeWarranty = (selected: OptionType | null) => {
    setSelectedWarranty(selected);
    setData('warranty', selected ? selected.value : '');
  };

  const handleCreateWarranty = (inputValue: string) => {
    const newOption: OptionType = {
      label: inputValue,
      value: inputValue,
    };

    setWarrantyOptions((prevOptions) => [...prevOptions, newOption]);
    setSelectedWarranty(newOption);
    setData('warranty', newOption.value);
  };

  // Estilos padrão do CreatableSelect (mantendo a estética Tailwind/shadcn)
  const selectStyles = {
    control: (baseStyles: any, state: any) => ({
      ...baseStyles,
      fontSize: '14px',
      boxShadow: 'none',
      border: 'none',
      background: 'transparent',
      paddingBottom: '2px',
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
    }),
    menuList: (base: any) => ({
      ...base,
      fontSize: '14px',
    }),
  };

  // Classes do shadcn/ui para o textarea
  const textareaClasses = "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <AppLayout>
      <Head title="Mensagens" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={PackagePlus} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Orçamentos</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div>
          <Button variant={'default'} asChild>
            <Link
              href={route('app.budgets.index')}
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
            {/* Linha 1: Categoria, Serviço, Modelo */}
            <div className="grid md:grid-cols-3 gap-4 mt-4">

              {/* Campo 1: CATEGORY (CreatableSelect) */}
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria (ou Criar Nova)</Label>
                <CreatableSelect
                  id="category"
                  value={selectedCategory}
                  options={categoryOptions}
                  onCreateOption={handleCreateCategory}
                  onChange={changeCategory}
                  isClearable
                  placeholder="Selecione ou digite para criar a categoria"
                  className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
                  styles={selectStyles}
                />
                <InputError className="mt-2" message={errors.category} />
              </div>

              {/* Campo 2: SERVICE (Input) */}
              <div className="grid gap-2">
                <Label htmlFor="service">Serviço</Label>
                <Input
                  id="service"
                  type="text"
                  value={data.service}
                  onChange={(e) => setData('service', e.target.value)}
                />
                {errors.service && <div className="text-red-500 text-sm">{errors.service}</div>}
              </div>

              {/* Campo 3: MODEL (Input) */}
              <div className="grid gap-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  type="text"
                  value={data.model}
                  onChange={(e) => setData('model', e.target.value)}
                />
                {errors.model && <div className="text-red-500 text-sm">{errors.model}</div>}
              </div>
            </div>

            {/* Linha 2: Part Number, Tempo Estimado, Garantia */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Campo 4: PART NUMBER (Input) */}
              <div className="grid gap-2">
                <Label htmlFor="part_value">Valor em Peças</Label>
                <Input
                  id="part_value"
                  type="text"
                  value={maskMoney(data.part_value)}
                  onChange={(e) => setData('part_value', e.target.value)}
                />
              </div>

              {/* Campo 5: ESTIMATED TIME (Input Numérico) */}
              <div className="grid gap-2">
                <Label htmlFor="estimated_time">Tempo Estimado (h)</Label>
                <Input
                  id="estimated_time"
                  value={data.estimated_time}
                  onChange={(e) => setData('estimated_time', e.target.value)}
                />
                {errors.estimated_time && <div className="text-red-500 text-sm">{errors.estimated_time}</div>}
              </div>

              {/* Campo 6: WARRANTY (CreatableSelect - Select Adicional) */}
              <div className="grid gap-2">
                <Label htmlFor="warranty">Garantia (Meses/Ano)</Label>
                <CreatableSelect
                  id="warranty"
                  value={selectedWarranty}
                  options={warrantyOptions}
                  onCreateOption={handleCreateWarranty}
                  onChange={changeWarranty}
                  isClearable
                  placeholder="Selecione ou defina a garantia"
                  className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
                  styles={selectStyles}
                />
                <InputError className="mt-2" message={errors.warranty} />
              </div>
            </div>

            {/* Linha 3: Valores */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Campo 7: LABOR VALUE (Input Numérico) */}
              <div className="grid gap-2">
                <Label htmlFor="labor_value">Valor da Mão de Obra</Label>
                <Input
                  id="labor_value"
                  value={maskMoney(data.labor_value)}
                  onChange={(e) => setData('labor_value', e.target.value)}
                />
                {errors.labor_value && <div className="text-red-500 text-sm">{errors.labor_value}</div>}
              </div>

              {/* Campo 8: TOTAL VALUE (Input Numérico) */}
              <div className="grid gap-2">
                <Label htmlFor="total_value">Valor Total</Label>
                <Input
                  id="total_value"
                  value={maskMoney(data.total_value)}
                  onChange={(e) => setData('total_value', e.target.value)}
                />
                {errors.total_value && <div className="text-red-500 text-sm">{errors.total_value}</div>}
              </div>
            </div>

            {/* Seção de TextAreas (Campos de uma coluna inteira) */}
            <div className="grid md:grid-cols-1 gap-4">
              {/* Campo 9: DESCRIPTION (TextArea) */}
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição do serviço e peças utilizadas</Label>
                <textarea
                  id="description"
                  rows={4}
                  className={textareaClasses} // Aplica as classes do shadcn/ui
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                ></textarea>
                {errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
              </div>

              {/* Campo 10: OBS (TextArea) */}
              <div className="grid gap-2">
                <Label htmlFor="obs">Observações</Label>
                <textarea
                  id="obs"
                  rows={4}
                  className={textareaClasses} // Aplica as classes do shadcn/ui
                  value={data.obs}
                  onChange={(e) => setData('obs', e.target.value)}
                ></textarea>
                {errors.obs && <div className="text-red-500 text-sm">{errors.obs}</div>}
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
      </div >
    </AppLayout >
  )
}