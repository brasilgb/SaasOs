import { toastSuccess, toastWarning } from '@/components/app-toast-messages';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Save, UserRound } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

type ProfileForm = {
    _method: string;
    name: string;
    avatar: File | null;
    current_password: string;
    password: string;
    password_confirmation: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel',
        href: route('app.dashboard'),
    },
    {
        title: 'Perfil',
        href: route('app.profile.edit'),
    },
];

export default function Profile() {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, errors, processing, reset } = useForm<ProfileForm>({
        _method: 'patch',
        name: auth.user.name,
        avatar: null,
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('app.profile.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset('current_password', 'password', 'password_confirmation');
                toastSuccess('Sucesso', 'Perfil atualizado com sucesso');
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }

                toastWarning('Erro ao validar', Object.values(errors)[0] ?? 'Confira os dados informados.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perfil" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <UserRound className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Perfil</h2>
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    <form onSubmit={submit} autoComplete="off" className="space-y-8">
                        <div className="mt-4 grid gap-4 md:grid-cols-6">
                            <div className="grid gap-2 md:col-span-6">
                                <Label htmlFor="avatar">Imagem do perfil</Label>
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
                                    <Avatar className="size-16">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback>{getInitials(auth.user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 gap-2">
                                        <Input
                                            id="avatar"
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            onChange={(event) => setData('avatar', event.target.files?.[0] ?? null)}
                                        />
                                        <p className="text-muted-foreground text-xs">Use JPG, PNG ou WebP até 2 MB.</p>
                                        <InputError className="mt-2" message={errors.avatar} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2 md:col-span-3">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" value={data.name} onChange={(event) => setData('name', event.target.value)} autoComplete="name" />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div className="grid gap-2 md:col-span-3">
                                <Label htmlFor="current_password">Senha atual</Label>
                                <Input
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    type="password"
                                    value={data.current_password}
                                    onChange={(event) => setData('current_password', event.target.value)}
                                    autoComplete="current-password"
                                />
                                <InputError className="mt-2" message={errors.current_password} />
                            </div>

                            <div className="grid gap-2 md:col-span-3">
                                <Label htmlFor="password">Nova senha</Label>
                                <Input
                                    id="password"
                                    ref={passwordInput}
                                    type="password"
                                    value={data.password}
                                    onChange={(event) => setData('password', event.target.value)}
                                    autoComplete="new-password"
                                />
                                <InputError className="mt-2" message={errors.password} />
                            </div>

                            <div className="grid gap-2 md:col-span-3">
                                <Label htmlFor="password_confirmation">Confirmar nova senha</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(event) => setData('password_confirmation', event.target.value)}
                                    autoComplete="new-password"
                                />
                                <InputError className="mt-2" message={errors.password_confirmation} />
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
    );
}
