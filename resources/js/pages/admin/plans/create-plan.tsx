import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Save, Users } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/layouts/admin/admin-layout";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('admin.dashboard'),
  },
  {
    title: 'Planos',
    href: route('admin.plans.index'),
  },
  {
    title: 'Adicionar',
    href: '#',
  },
];

export default function CreatePlan() {

  const { data, setData, post, progress, processing, reset, errors } = useForm({
    name: '',
    description: '',
    price: '',
    period: '',
    resources: '',
    aditional: '',
    paiment_method: '',
    observations: '',
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    post(route('admin.plans.store'), {
      onSuccess: () => reset(),
    });
  }

  return (
    <AdminLayout>
      <Head title="Planos" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={Users} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Planos</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div>
          <Button variant={'default'} asChild>
            <Link
              href={route('admin.plans.index')}
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
            <div className="grid sm:grid-cols-3 gap-4 mt-4">

              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
              </div>

              <div className="col-span-2 grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  type="text"
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Preço</Label>
                <Input
                  type="text"
                  id="price"
                  value={data.price}
                  onChange={(e) => setData('price', e.target.value)}
                />
              {errors.price && <div className="text-red-500 text-sm">{errors.price}</div>}
              </div>

              <div className="grid gap-2 col-span-2">
                <Label htmlFor="paiment_method">Método de pagamento</Label>
                <Input
                  type="text"
                  id="paiment_method"
                  value={data.paiment_method}
                  onChange={(e) => setData('paiment_method', e.target.value)}
                />
                {errors.paiment_method && <div className="text-red-500 text-sm">{errors.paiment_method}</div>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="resources">Recursos</Label>
                <Textarea
                  id="resources"
                  value={data.resources}
                  onChange={(e) => setData('resources', e.target.value)}
                />
                {errors.resources && <div className="text-red-500 text-sm">{errors.resources}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="aditional">Adicional</Label>
                <Textarea
                  id="aditional"
                  value={data.aditional}
                  onChange={(e) => setData('aditional', e.target.value)}
                />
                {errors.aditional && <div className="text-red-500 text-sm">{errors.aditional}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={data.observations}
                  onChange={(e) => setData('observations', e.target.value)}
                  maxLength={13}
                />
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
    </AdminLayout>
  )
}
