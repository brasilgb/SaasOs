import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Save, Users } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { maskCep, maskCpfCnpj, maskPhone, unMask } from "@/Utils/mask";
import { toast } from "sonner";
import apios from "@/Utils/connectApi";
import { useEffect } from "react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Clientes',
    href: route('app.customers.index'),
  },
  {
    title: 'Adicionar',
    href: '#',
  },
];

export default function CreateCustomer({ customerlast }: any) {
  const { flash } = usePage().props as any;
  const { data, setData, post, progress, processing, reset, errors } = useForm({
    cpf: '',
    name: '',
    birth: '',
    email: '',
    cep: '',
    state: '',
    city: '',
    district: '',
    street: '',
    complement: '',
    number: '',
    phone: '',
    contactname: '',
    whatsapp: '',
    contactphone: '',
    observations: '',
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    post(route('app.customers.store'), {
      onSuccess: () => reset(),
    });
  }

  const getCep = (cep: string) => {
    const cleanCep = unMask(cep);
    fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      .then((response) => response.json())
      .then((result) => {
        setData((data) => ({ ...data, state: result.uf }));
        setData((data) => ({ ...data, city: result.localidade }));
        setData((data) => ({ ...data, district: result.bairro }));
        setData((data) => ({ ...data, street: result.logradouro }));
        setData((data) => ({ ...data, complement: result.complemento }));
      })
      .catch((error) => console.error(error));
  };

  return (
    <AppLayout>
      <Head title="Clientes" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={Users} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Clientes</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div>
          <Button variant={'default'} asChild>
            <Link
              href={route('app.customers.index')}
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
            <div className="grid md:grid-cols-6 gap-4 mt-4">

              <div className=" gap-2">
                <Label htmlFor="name">CPF/CNPJ</Label>
                <Input
                  type="text"
                  id="cpf"
                  value={maskCpfCnpj(data.cpf)}
                  onChange={(e) => setData('cpf', e.target.value)}
                  maxLength={18}
                />
                {errors.cpf && <div className="text-red-500 text-sm">{errors.cpf}</div>}
              </div>

              <div className=" gap-2">
                <Label htmlFor="birth">Nascimento</Label>
                <Input
                  type="date"
                  id="birth"
                  value={data.birth}
                  onChange={(e) => setData('birth', e.target.value)}
                />
              </div>

              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
              </div>

              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  type="text"
                  id="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                />
                {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
              </div>

            </div>

            <div className="grid md:grid-cols-6 gap-4 mt-4">

              <div className="grid gap-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  type="text"
                  id="cep"
                  value={maskCep(data.cep)}
                  onChange={(e) => setData('cep', e.target.value)}
                  onBlur={(e) => getCep(e.target.value)}
                  maxLength={9}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="state">UF</Label>
                <Input
                  type="text"
                  id="state"
                  value={data.state}
                  onChange={(e) => setData('state', e.target.value)}
                />
                {errors.state && <div>{errors.state}</div>}
              </div>

              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  type="text"
                  id="city"
                  value={data.city}
                  onChange={(e) => setData('city', e.target.value)}
                />
              </div>

              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="district">Bairro</Label>
                <Input
                  type="text"
                  id="district"
                  value={data.district}
                  onChange={(e) => setData('district', e.target.value)}
                />
              </div>

            </div>

            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="street">Endereço</Label>
                <Input
                  type="text"
                  id="street"
                  value={data.street}
                  onChange={(e) => setData('street', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  type="text"
                  id="complement"
                  value={data.complement}
                  onChange={(e) => setData('complement', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  type="text"
                  id="number"
                  value={data.number}
                  onChange={(e) => setData('number', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  type="text"
                  id="phone"
                  value={maskPhone(data.phone)}
                  onChange={(e) => setData('phone', e.target.value)}
                  maxLength={15}
                />
                {errors.phone && <div className="text-red-500 text-sm">{errors.phone}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="whatsapp">Whatsapp</Label>
                <Input
                  type="text"
                  id="whatsapp"
                  value={data.whatsapp}
                  onChange={(e) => setData('whatsapp', e.target.value)}
                />
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="contactname">Contato</Label>
                <Input
                  type="text"
                  id="contactname"
                  value={data.contactname}
                  onChange={(e) => setData('contactname', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contactphone">Telefone do contato</Label>
                <Input
                  type="text"
                  id="contactphone"
                  value={maskPhone(data.contactphone)}
                  onChange={(e) => setData('contactphone', e.target.value)}
                  maxLength={15}
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
