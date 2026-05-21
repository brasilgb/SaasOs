import { toastSuccess } from '@/components/app-toast-messages';
import { Icon } from '@/components/icon';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { rolesUser } from '@/Utils/dataSelect';
import { maskPhone } from '@/Utils/mask';
import selectStyles from '@/Utils/selectStyles';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeClosed, Save, UserCog } from 'lucide-react';
import { useState } from 'react';
import Select from 'react-select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel',
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

export default function CreateUser({ user, page, search }: any) {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { auth } = usePage().props as any;
    const getInitials = useInitials();
    const isOperator = auth?.role === 'operator';

    const { data, setData, patch, progress, processing, reset, errors } = useForm<any>({
        tenant_id: auth.user.tenant_id,
        name: user?.name,
        email: user?.email,
        telephone: user?.telephone,
        whatsapp: user?.whatsapp,
        avatar: null,
        roles: user?.roles,
        can_view_all_orders: Boolean(user?.can_view_all_orders),
        status: user?.status,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        patch(route('app.users.update', user?.id), {
            forceFormData: true,
            onSuccess: () => {
                toastSuccess('Sucesso', 'Cadastro alterado com sucesso');
            },
        });
    };

    const changeRoles = (selected: any) => {
        setData('roles', selected?.value);
        if (selected?.value !== '3') {
            setData('can_view_all_orders', false);
        }
    };
    const optionsRolesUser = rolesUser
        .filter((role: any) => role.label !== 'RootSystem' && role.label !== 'RootApp')
        .filter((role: any) => (isOperator ? role.value === '2' || role.value === '3' : true))
        .map((role: any) => ({
            value: role.value,
            label: role.label,
        }));
    const defaultStatus = rolesUser?.filter((o: any) => o.value == user?.roles).map((opt: any) => ({ value: opt.label, label: opt.label }));
    const canManageTechnicianMaster = ['root_system', 'root_app', 'administrator'].includes(auth?.role);
    const showTechnicianMasterSwitch = canManageTechnicianMaster && String(data.roles) === '3';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuários" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={UserCog} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Usuários</h2>
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div>
                    <Button variant={'default'} asChild>
                        <Link href={route('app.users.index', { page: page, search: search })}>
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
                            <div className="grid gap-2 md:col-span-6">
                                <Label htmlFor="avatar">Imagem do perfil</Label>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <Avatar className="size-16">
                                        <AvatarImage src={user?.avatar} alt={user?.name} />
                                        <AvatarFallback>{getInitials(data.name || 'Usuário')}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 gap-2">
                                        <Input
                                            id="avatar"
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            onChange={(e) => setData('avatar', e.target.files?.[0] ?? null)}
                                        />
                                        <p className="text-muted-foreground text-xs">Use JPG, PNG ou WebP até 2 MB.</p>
                                        <InputError className="mt-2" message={errors.avatar} />
                                    </div>
                                </div>
                            </div>

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
                                <Label htmlFor="recipient">Funções do usuário</Label>
                                <Select
                                    isDisabled={data.roles === 9 ? true : false}
                                    menuPosition="fixed"
                                    defaultValue={defaultStatus}
                                    options={optionsRolesUser}
                                    onChange={changeRoles}
                                    placeholder="Selecione o recebedor"
                                    className="min-w-0"
                                    styles={selectStyles}
                                />
                                <InputError className="mt-2" message={errors.roles} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status do usuário</Label>

                                <div className="flex items-center gap-3">
                                    <Switch id="status" checked={data.status} onCheckedChange={(checked) => setData('status', checked)} />

                                    <span className="text-muted-foreground text-sm">{data.status ? 'Ativo' : 'Inativo'}</span>
                                </div>
                            </div>

                            {showTechnicianMasterSwitch && (
                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="can_view_all_orders">Técnico master</Label>

                                    <div className="flex items-center gap-3">
                                        <Switch
                                            id="can_view_all_orders"
                                            checked={data.can_view_all_orders}
                                            onCheckedChange={(checked) => setData('can_view_all_orders', checked)}
                                        />

                                        <span className="text-muted-foreground text-sm">
                                            {data.can_view_all_orders
                                                ? 'Pode visualizar todas as ordens de serviço'
                                                : 'Visualiza apenas ordens atribuídas a ele'}
                                        </span>
                                    </div>
                                </div>
                            )}
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
    );
}
