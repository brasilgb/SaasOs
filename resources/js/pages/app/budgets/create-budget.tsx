import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Calculator, PackagePlus, Save } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import CreatableSelect from 'react-select/creatable';
import InputError from "@/components/input-error";
import { useCallback, useEffect, useState } from "react";
import { maskMoney, maskMoneyDot, unMask } from "@/Utils/mask";

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
  const { auth } = usePage().props as any;

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

  const calculateTotal = useCallback(() => {
    const partValue = parseFloat(unMask(data.part_value)) || 0;
    const laborValue = parseFloat(unMask(data.labor_value)) || 0;
    const total = partValue + laborValue;
    setData('total_value', maskMoney(String(total)));
  }, [data.part_value, data.labor_value, setData]);

  useEffect(() => {
    if (data.part_value || data.labor_value) {
      calculateTotal();
    }
  }, [data.part_value, data.labor_value, calculateTotal]);

  useEffect(() => {
    setData((data: any) => ({
      ...data,
      part_value: maskMoneyDot(data.part_value),
      labor_value: maskMoneyDot(data.labor_value),
      total_value: maskMoneyDot(data.total_value),
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

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
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
                <InputError className="mt-2" message={errors.service} />
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
                <InputError className="mt-2" message={errors.model} />
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
                  onChange={(e) => setData('part_value', maskMoney(e.target.value))}
                />
                <InputError className="mt-2" message={errors.part_value} />
              </div>

              {/* Campo 5: ESTIMATED TIME (Input Numérico) */}
              <div className="grid gap-2">
                <Label htmlFor="estimated_time">Tempo Estimado (h)</Label>
                <Input
                  id="estimated_time"
                  value={data.estimated_time}
                  onChange={(e) => setData('estimated_time', e.target.value)}
                />
                <InputError className="mt-2" message={errors.estimated_time} />
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
                  onChange={(e) => setData('labor_value', maskMoney(e.target.value))}
                />
                <InputError className="mt-2" message={errors.labor_value} />
              </div>

              {/* Campo 8: TOTAL VALUE (Input Numérico) */}
              <div className="grid gap-2">
                <Label htmlFor="total_value">Valor Total</Label>
                <div className="relative">
                  <Input
                    id="total_value"
                    value={maskMoney(data.total_value)}
                    onChange={(e) => setData('total_value', maskMoney(e.target.value))}
                    className="pr-10"
                  />
                  <button type="button" onClick={calculateTotal} className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Calculator className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                <InputError className="mt-2" message={errors.total_value} />
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
                <InputError className="mt-2" message={errors.description} />
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
                <InputError className="mt-2" message={errors.obs} />
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