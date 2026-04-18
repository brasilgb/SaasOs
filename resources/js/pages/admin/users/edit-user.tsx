import { toastSuccess } from '@/components/app-toast-messages';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/admin/admin-layout';
import { BreadcrumbItem } from '@/types';
import { rolesUser } from '@/Utils/dataSelect';
import { maskPhone } from '@/Utils/mask';
import selectStyles from '@/Utils/selectStyles';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeClosed, Save, UserCog } from 'lucide-react';
import { useState } from 'react';
import Select from 'react-select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Usuários',
        href: route('app.users.index'),
    },
    {
        title: 'Alterar',
        href: '#',
    },
];

export default function CreateUser({ user, tenants }: any) {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const newTenant = tenants?.map((tenant: any) => ({
        value: tenant.id,
        label: tenant.company,
    }));

    const { data, setData, patch, progress, processing, reset, errors } = useForm({
        tenant_id: user?.tenant_id,
        name: user?.name,
        email: user?.email,
        telephone: user?.telephone,
        whatsapp: user?.whatsapp,
        roles: user?.roles,
        status: user?.status,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        patch(route('admin.users.update', user?.id), {
            onSuccess: () => {
                toastSuccess('Sucesso', 'Cadastro alterado com sucesso');
            },
        });
    };

    const defaultRoles = rolesUser?.filter((o: any) => o.value == user?.roles).map((opt: any) => ({ value: opt.label, label: opt.label }));
    const defaultTenants = newTenant?.filter((o: any) => o.value == user?.tenant_id).map((opt: any) => ({ value: opt.label, label: opt.label }));

    const changeRoles = (selected: any) => {
        setData('roles', selected?.value);
    };

    const changeTenant = (selected: any) => {
        setData('tenant_id', selected?.value);
    };

    return (
        <AdminLayout>
            <Head title="Usuários" />

            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={UserCog} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Usuários</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div>
                    <Button variant={'default'} asChild>
                        <Link href={route('admin.users.index')}>
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
                        <div className="mt-4 grid gap-4 md:grid-cols-6">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input value={data.name} type="text" id="name" onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" type="text" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="telephone">Telefone</Label>
                                <Input
                                    id="telephone"
                                    type="text"
                                    value={maskPhone(data.telephone)}
                                    onChange={(e) => setData('telephone', e.target.value)}
                                    maxLength={15}
                                />
                                {errors.telephone && <div className="text-sm text-red-500">{errors.telephone}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="whatsapp">Whatsapp</Label>
                                <Input
                                    id="whatsapp"
                                    type="text"
                                    value={maskPhone(data.whatsapp)}
                                    onChange={(e) => setData('whatsapp', e.target.value)}
                                    maxLength={15}
                                />
                                {errors.whatsapp && <div className="text-sm text-red-500">{errors.whatsapp}</div>}
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <div className="absolute top-0 right-0 text-gray-600">
                                        <Button variant={'link'} size={'icon'} type="button" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeClosed /> : <Eye />}
                                        </Button>
                                    </div>
                                </div>
                                {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirme a senha</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    <div className="absolute top-0 right-0 text-gray-600">
                                        <Button variant={'link'} size={'icon'} type="button" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeClosed /> : <Eye />}
                                        </Button>
                                    </div>
                                </div>
                                {errors.password_confirmation && <div className="text-sm text-red-500">{errors.password_confirmation}</div>}
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="recipient">Empresa</Label>
                                <Select
                                    defaultValue={defaultTenants}
                                    options={newTenant}
                                    onChange={changeTenant}
                                    placeholder="Selecione a empresa"
                                    className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    styles={selectStyles}
                                />
                                <InputError className="mt-2" message={errors.tenant_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="recipient">Funções do usuário</Label>
                                <Select
                                    defaultValue={defaultRoles}
                                    options={rolesUser}
                                    onChange={changeRoles}
                                    placeholder="Selecione a função"
                                    className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    styles={selectStyles}
                                />
                                <InputError className="mt-2" message={errors.roles} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status do usuário</Label>
                            <Switch id="status" checked={data.status} onCheckedChange={(checked: any) => setData('status', checked)} />
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
