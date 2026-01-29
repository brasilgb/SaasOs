import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import { Loader2Icon, Save, Search } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { maskCep, maskCpfCnpj, maskPhone, unMask } from "@/Utils/mask";
import { useEffect, useState } from "react";
import { DatePicker } from "@/components/date-picker";
import { Customer } from "@/types";
import { useZipcodeAutocomplete } from "@/hooks/useZipcodeAutocomplete";
import { toastSuccess } from "@/components/app-toast-messages";

export default function CustomerForm({ initialData }: any) {

  const isEdit = !!initialData

  const [zipcodeToSearch, setZipcodeToSearch] = useState<string | null>(null)

  const { data, setData, post, progress, processing, reset, setError, clearErrors, errors, put } = useForm<Customer>(
    initialData || {}
  );

  const handleCreate = () => {
  post(route('app.customers.store'), {
    onSuccess: () => {
      toastSuccess("Cliente salvo", "Cadastro realizado com sucesso")
      reset()
    },
  })
}

const handleUpdate = () => {
  put(route('app.customers.update', initialData.id), {
    onSuccess: () => {
      toastSuccess("Cliente alterado", "Edição realizada com sucesso")
    },
  })
}

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()

  if (isEdit) {
    handleUpdate()
  } else {
    handleCreate()
  }
}


  useEffect(() => {
    setData((data) => ({ ...data, cpf: unMask(data.cpf) }));
  }, [data.cpf]);

  const { isZipcodeLoading } = useZipcodeAutocomplete<Customer>({
    zipcode: zipcodeToSearch || "",
    paths: {
      zipcode: "zipcode",
      state: "state",
      city: "city",
      district: "district",
      street: "street",
      complement: "complement",
    },
    setData: (key: any, value: any) => {
      if (zipcodeToSearch !== null) {
        setData(key, value)
      }
    },
    setError,
    clearErrors,
  } as any)

  return (

    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
      <div className="grid md:grid-cols-6 gap-4 mt-4">
        <div className="grid gap-2">
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

        <div className="grid gap-2">
          <Label htmlFor="birth">Nascimento</Label>
          <DatePicker
            mode="single"
            date={data.birth}
            setDate={(value) => {
              if (!value) {
                setData('birth', '')
                return
              }
              const d = value as Date
              const formatted = [
                d.getFullYear(),
                String(d.getMonth() + 1).padStart(2, '0'),
                String(d.getDate()).padStart(2, '0'),
              ].join('-')

              setData('birth', formatted)
            }}
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
          <Label htmlFor="zipcode">CEP</Label>
          <div className="flex gap-2 relative">
            <div className="relative w-full">
              <Input
                type="text"
                id="zipcode"
                value={maskCep(data.zipcode)}
                onChange={(e) => setData('zipcode', e.target.value)}
                maxLength={9}
                disabled={isZipcodeLoading}
              />
              {isZipcodeLoading && (
                <Loader2Icon
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground"
                />
              )}
            </div>
            <Button type="button" size="icon" variant="outline" onClick={() => setZipcodeToSearch(data.zipcode)}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
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
            onChange={(e) => setData('number', Number(e.target.value))}
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
  )
}
