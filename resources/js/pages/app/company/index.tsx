import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { Cog, Save } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { maskCep, maskCnpj, maskPhone, unMask } from "@/Utils/mask";
import { toastSuccess, toastWarning } from "@/components/app-toast-messages";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Dados da empresa',
        href: "#",
    },
];

export default function Company({ company }: any) {

    const { data, setData, patch, progress, processing, errors } = useForm({
        shortname: company?.shortname,
        companyname: company?.companyname,
        cnpj: company?.cnpj,
        logo: null,
        zip_code: company?.zip_code,
        state: company?.state,
        city: company?.city,
        district: company?.district,
        street: company?.street,
        number: company?.number,
        complement: company?.complement,
        telephone: company?.telephone,
        whatsapp: company?.whatsapp,
        site: company?.site,
        email: company?.email,
    });

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    router.post(route('app.company.update', company.id), 
        {
            // DADOS (Primeiro Objeto)
            _method: "put", // Necessário para simular PUT em formulários com arquivos (logo)
            shortname: data.shortname,
            companyname: data.companyname,
            cnpj: data.cnpj,
            logo: data.logo,
            zip_code: data.zip_code,
            state: data.state,
            city: data.city,
            district: data.district,
            street: data.street,
            number: data.number,
            complement: data.complement,
            telephone: data.telephone,
            whatsapp: data.whatsapp,
            site: data.site,
            email: data.email,
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                toastSuccess("Sucesso", "Dados da empresa ajustados com sucesso");
            },
            onError: (errors: any) => {
                toastWarning("Erro ao validar:", errors);
            }
        }
    );
};

    const getCep = (zip_code: string) => {
        const cleanCep = unMask(zip_code);
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

            <Head title="Dados da empresa" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={Cog} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Dados da empresa</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className='flex items-center justify-between p-4'>
                <div>

                </div>
            </div>

            <div className='p-4'>
                <div className='border rounded-lg p-2'>
                    <div className="w-24 my-10">
                        <img
                            src={`/storage/logos/${company.logo ? company.logo : "default.png"}`}
                            alt="Imagem de logo"
                        />
                    </div>
                    <form onSubmit={handleSubmit} autoComplete="off"className="space-y-8">
                        <div className="grid md:grid-cols-6 gap-4 mt-4">

                            <div className="grid gap-2">
                                <Label htmlFor="logo">Logotipo</Label>
                                <Input
                                    type="file"
                                    id="logo"
                                    onChange={(e: any) => setData('logo', e.target.files[0])}
                                />
                                {errors.logo && <div className="text-red-500 text-sm">{errors.logo}</div>}
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="name">CPF/CNPJ</Label>
                                <Input
                                    type="text"
                                    id="cnpj"
                                    value={maskCnpj(data.cnpj)}
                                    onChange={(e) => setData('cnpj', e.target.value)}
                                    maxLength={18}
                                />
                                {errors.cnpj && <div className="text-red-500 text-sm">{errors.cnpj}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="shortname">Nome curto (para etiqueta)</Label>
                                <Input
                                    type="text"
                                    id="shortname"
                                    value={data.shortname}
                                    onChange={(e) => setData('shortname', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="companyname">Razão social</Label>
                                <Input
                                    type="text"
                                    id="companyname"
                                    value={data.companyname}
                                    onChange={(e) => setData('companyname', e.target.value)}
                                />
                                {errors.companyname && <div className="text-red-500 text-sm">{errors.companyname}</div>}
                            </div>

                        </div>

                        <div className="grid md:grid-cols-6 gap-4 mt-4">

                            <div className="grid gap-2">
                                <Label htmlFor="zip_code">CEP</Label>
                                <Input
                                    type="text"
                                    id="zip_code"
                                    value={maskCep(data.zip_code)}
                                    onChange={(e) => setData('zip_code', e.target.value)}
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
                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="street">Logradouro</Label>
                                <Input
                                    type="text"
                                    id="street"
                                    value={data.street}
                                    onChange={(e) => setData('street', e.target.value)}
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

                            <div className="grid gap-2">
                                <Label htmlFor="complement">Complemento</Label>
                                <Input
                                    type="text"
                                    id="complement"
                                    value={data.complement}
                                    onChange={(e) => setData('complement', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-6 gap-4 mt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="telephone">Telefone</Label>
                                <Input
                                    type="text"
                                    id="telephone"
                                    value={maskPhone(data.telephone)}
                                    onChange={(e) => setData('telephone', e.target.value)}
                                    maxLength={15}
                                />
                                {errors.telephone && <div className="text-red-500 text-sm">{errors.telephone}</div>}
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
                                <Label htmlFor="site">Site</Label>
                                <Input
                                    type="text"
                                    id="site"
                                    value={data.site}
                                    onChange={(e) => setData('site', e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    type="text"
                                    id="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
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
        </AppLayout>
    )
}
