import { Head, router, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { maskCnpj, maskPhone, unMask } from '@/Utils/mask';

type RegisterForm = {
    cnpj: string;
    company: string;
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        cnpj: '',
        company: '',
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setData((data: any) => ({ ...data, cnpj: unMask(data.cnpj) }));
        setData((data: any) => ({ ...data, phone: unMask(data.phone) }));
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Criar uma conta" description="Digite seus dados abaixo para criar sua conta">
            <Head title="Criar uma conta" />
            <div className='h-[70vh] overflow-y-auto'>
                <form className="flex flex-col gap-6 mr-6" onSubmit={submit}>
                    <div className="grid gap-6">

                        <div className="grid gap-2">
                            <Label htmlFor="company">Razão social</Label>
                            <Input
                                id="company"
                                type="text"
                                autoFocus
                                tabIndex={1}
                                autoComplete="company"
                                value={data.company}
                                onChange={(e) => setData('company', e.target.value)}
                                disabled={processing}
                                placeholder="Razão social"
                            />
                            <InputError message={errors.company} className="mt-2" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input
                                id="cnpj"
                                type="text"
                                tabIndex={2}
                                autoComplete="cnpj"
                                value={maskCnpj(data.cnpj)}
                                onChange={(e) => setData('cnpj', e.target.value)}
                                disabled={processing}
                            />
                            <InputError message={errors.cnpj} className="mt-2" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome completo</Label>
                            <Input
                                id="name"
                                type="text"
                                tabIndex={3}
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                disabled={processing}
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                tabIndex={4}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                disabled={processing}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                type="phone"
                                tabIndex={4}
                                autoComplete="phone"
                                value={maskPhone(data.phone)}
                                onChange={(e) => setData('phone', e.target.value)}
                                disabled={processing}
                                maxLength={15}
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="whatsapp">Whatsapp</Label>
                            <Input
                                id="whatsapp"
                                type="whatsapp"
                                tabIndex={4}
                                autoComplete="whatsapp"
                                value={data.whatsapp}
                                onChange={(e) => setData('whatsapp', e.target.value)}
                                disabled={processing}
                            />
                            <InputError message={errors.whatsapp} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                tabIndex={5}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="Senha"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirmar senha</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                tabIndex={6}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="Confirmar senha"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                            {processing ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Cadastrando...
                                </>
                            ) : (
                                "Entrar"
                            )}
                        </Button>
                    </div>

                    <div className="text-muted-foreground text-center text-sm">
                        Já tem uma conta?{' '}
                        <TextLink href={route('login')} tabIndex={6}>
                            Entrar
                        </TextLink>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
