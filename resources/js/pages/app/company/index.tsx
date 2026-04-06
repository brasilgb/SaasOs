import { toastSuccess, toastWarning } from '@/components/app-toast-messages';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskCep, maskCnpj, maskPhone, unMask } from '@/Utils/mask';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Cog, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Dados da empresa',
        href: '#',
    },
];

export default function Company({ company }: any) {
    const { auth } = usePage<{ auth?: { permissions?: string[] } }>().props;
    const canManageCompany = auth?.permissions?.includes('company');
    const { data, setData, processing, errors } = useForm({
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

        router.post(
            route('app.company.update', company.id),
            {
                // DADOS (Primeiro Objeto)
                _method: 'put', // Necessário para simular PUT em formulários com arquivos (logo)
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
                    toastSuccess('Sucesso', 'Dados da empresa ajustados com sucesso');
                },
                onError: (errors: any) => {
                    toastWarning('Erro ao validar:', errors);
                },
            },
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
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Cog} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Dados da empresa</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div></div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    <div className="my-10 w-24">
                        <img src={`${company?.logo ? `/storage/logos/${company?.logo}` : '/images/default.png'}`} alt="Imagem de logo" />
                    </div>
                    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
                        <div className="mt-4 grid gap-4 md:grid-cols-6">
                            <div className="grid gap-2">
                                <Label htmlFor="logo">Logotipo</Label>
                                <Input type="file" id="logo" disabled={!canManageCompany} onChange={(e: any) => setData('logo', e.target.files[0])} />
                                {errors.logo && <div className="text-sm text-red-500">{errors.logo}</div>}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="name">CPF/CNPJ</Label>
                                <Input
                                    type="text"
                                    id="cnpj"
                                    value={maskCnpj(data.cnpj)}
                                    disabled={!canManageCompany}
                                    onChange={(e) => setData('cnpj', e.target.value)}
                                    maxLength={18}
                                />
                                {errors.cnpj && <div className="text-sm text-red-500">{errors.cnpj}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="shortname">Nome curto (para etiqueta)</Label>
                                <Input
                                    type="text"
                                    id="shortname"
                                    value={data.shortname}
                                    disabled={!canManageCompany}
                                    onChange={(e) => setData('shortname', e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="companyname">Razão social</Label>
                                <Input
                                    type="text"
                                    id="companyname"
                                    value={data.companyname}
                                    disabled={!canManageCompany}
                                    onChange={(e) => setData('companyname', e.target.value)}
                                />
                                {errors.companyname && <div className="text-sm text-red-500">{errors.companyname}</div>}
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-6">
                            <div className="grid gap-2">
                                <Label htmlFor="zip_code">CEP</Label>
                                <Input
                                    type="text"
                                    id="zip_code"
                                    value={maskCep(data.zip_code)}
                                    disabled={!canManageCompany}
                                    onChange={(e) => setData('zip_code', e.target.value)}
                                    onBlur={(e) => getCep(e.target.value)}
                                    maxLength={9}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="state">UF</Label>
                                <Input type="text" id="state" value={data.state} disabled={!canManageCompany} onChange={(e) => setData('state', e.target.value)} />
                                {errors.state && <div>{errors.state}</div>}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input type="text" id="city" value={data.city} disabled={!canManageCompany} onChange={(e) => setData('city', e.target.value)} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="district">Bairro</Label>
                                <Input
                                    type="text"
                                    id="district"
                                    value={data.district}
                                    disabled={!canManageCompany}
                                    onChange={(e) => setData('district', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-4">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="street">Logradouro</Label>
                                <Input type="text" id="street" value={data.street} disabled={!canManageCompany} onChange={(e) => setData('street', e.target.value)} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="number">Número</Label>
                                <Input type="text" id="number" value={data.number} disabled={!canManageCompany} onChange={(e) => setData('number', e.target.value)} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="complement">Complemento</Label>
                                <Input
                                    type="text"
                                    id="complement"
                                    value={data.complement}
                                    disabled={!canManageCompany}
                                    onChange={(e) => setData('complement', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-6">
                            <div className="grid gap-2">
                                <Label htmlFor="telephone">Telefone</Label>
                                <Input
                                    type="text"
                                    id="telephone"
                                    value={maskPhone(data.telephone)}
                                    disabled={!canManageCompany}
                                    onChange={(e) => setData('telephone', e.target.value)}
                                    maxLength={15}
                                />
                                {errors.telephone && <div className="text-sm text-red-500">{errors.telephone}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="whatsapp">Whatsapp</Label>
                                <Input
                                    type="text"
                                    id="whatsapp"
                                    value={maskPhone(data.whatsapp)}
                                    disabled={!canManageCompany}
                                    onChange={(e) => setData('whatsapp', e.target.value)}
                                    maxLength={15}
                                />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="site">Site</Label>
                                <Input type="text" id="site" value={data.site} disabled={!canManageCompany} onChange={(e) => setData('site', e.target.value)} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input type="text" id="email" value={data.email} disabled={!canManageCompany} onChange={(e) => setData('email', e.target.value)} />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            {canManageCompany && (
                                <Button type="submit" disabled={processing}>
                                    <Save />
                                    Salvar
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
