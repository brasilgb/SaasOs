import { statusSaas } from '@/Utils/dataSelect';
import { maskCep, maskCpfCnpj, maskPhone, unMask } from '@/Utils/mask';
import { toastSuccess } from '@/components/app-toast-messages';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin/admin-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building, Save } from 'lucide-react';
import Select from 'react-select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Empresas',
        href: route('admin.tenants.index'),
    },
    {
        title: 'Editar',
        href: '#',
    },
];

export default function EditTenant({ plans, tenant }: any) {
    const allPlans = plans.map((plan: any) => ({
        value: plan.id,
        label: plan.name,
    }));

    const { data, setData, patch, processing, reset, errors } = useForm({
        company: tenant.company,
        name: tenant.name,
        cnpj: tenant.cnpj,
        email: tenant.email,
        phone: tenant.phone,
        whatsapp: tenant.whatsapp,
        zip_code: tenant.zip_code,
        state: tenant.state,
        city: tenant.city,
        district: tenant.district,
        street: tenant.street,
        complement: tenant.complement,
        number: tenant.number,
        plan_id: tenant.plan_id,
        status: tenant.status,
        observations: tenant.observations,
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        patch(route('admin.tenants.update', tenant.id), {
            onSuccess: () => {
                toastSuccess('Sucesso', 'Cadastro alterado com sucesso');
            },
        });
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

    const changePlan = (selected: any) => {
        setData('plan_id', selected?.value);
    };

    const changeStatus = (selected: any) => {
        setData('status', selected?.value);
    };

    const defaultPlan = allPlans?.filter((o: any) => o.value == tenant?.plan_id).map((opt: any) => ({ value: opt.value, label: opt.label }));
    const defaultStatusSaas = statusSaas?.filter((o: any) => o.value == tenant?.status).map((opt: any) => ({ value: opt.value, label: opt.label }));

    return (
        <AdminLayout>
            <div className="flex h-16 items-center justify-between px-4">
                <Head title="Empresas" />
                <div className="flex items-center gap-2">
                    <Icon iconNode={Building} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Empresas</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div>
                    <Button variant={'default'} asChild>
                        <Link href={route('admin.tenants.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar</span>
                        </Link>
                    </Button>
                </div>
                <div></div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
                        <div className="mt-4 grid gap-4 md:grid-cols-9">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="company">Razão social</Label>
                                <Input type="text" id="company" value={data.company} onChange={(e) => setData('company', e.target.value)} />
                                {errors.company && <div className="text-sm text-red-500">{errors.company}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cnpj">CPF/CNPJ</Label>
                                <Input
                                    type="text"
                                    id="cnpj"
                                    value={maskCpfCnpj(data.cnpj)}
                                    onChange={(e) => setData('cnpj', e.target.value)}
                                    maxLength={18}
                                />
                                {errors.cnpj && <div className="text-sm text-red-500">{errors.cnpj}</div>}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input type="text" id="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="name">Contato</Label>
                                <Input type="text" id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input
                                    type="text"
                                    id="phone"
                                    value={maskPhone(data.phone)}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    maxLength={15}
                                />
                                {errors.phone && <div className="text-sm text-red-500">{errors.phone}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="whatsapp">Whatsapp</Label>
                                <Input
                                    type="text"
                                    id="whatsapp"
                                    value={data.whatsapp}
                                    onChange={(e) => setData('whatsapp', e.target.value)}
                                    maxLength={13}
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-6">
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
                                <Input type="text" id="state" value={data.state} onChange={(e) => setData('state', e.target.value)} />
                                {errors.state && <div>{errors.state}</div>}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input type="text" id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="district">Bairro</Label>
                                <Input type="text" id="district" value={data.district} onChange={(e) => setData('district', e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-4">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="street">Endereço</Label>
                                <Input type="text" id="street" value={data.street} onChange={(e) => setData('street', e.target.value)} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="complement">Complemento</Label>
                                <Input type="text" id="complement" value={data.complement} onChange={(e) => setData('complement', e.target.value)} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="number">Número</Label>
                                <Input type="text" id="number" value={data.number} onChange={(e) => setData('number', e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-4">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="plan">Plano</Label>
                                <Select
                                    defaultValue={defaultPlan}
                                    options={allPlans}
                                    onChange={changePlan}
                                    placeholder="Selecione o plano"
                                    className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                <InputError className="mt-2" message={errors.plan_id} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    defaultValue={defaultStatusSaas}
                                    options={statusSaas}
                                    onChange={changeStatus}
                                    placeholder="Selecione o status"
                                    className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                <InputError className="mt-2" message={errors.status} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="observations">Observações</Label>
                            <Textarea id="observations" value={data.observations} onChange={(e) => setData('observations', e.target.value)} />
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
    );
}
