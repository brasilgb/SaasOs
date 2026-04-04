import { toastSuccess } from '@/components/app-toast-messages';
import AppearanceTabs from '@/components/appearance-tabs';
import { Breadcrumbs } from '@/components/breadcrumbs';
import HeadingSmall from '@/components/heading-small';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin/admin-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Building, Save } from 'lucide-react';

interface Settings {
    id: number;
    name: string;
    logo?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Configurações',
        href: '#',
    },
];

export default function SettingsIndex({ settings }: { settings: Settings }) {
    const { data, setData, processing, errors } = useForm({
        name: settings?.name,
        logo: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        router.post(
            route('admin.settings.update', settings.id),
            {
                _method: 'put',
                name: data?.name,
                logo: data?.logo,
            },
            {
                onSuccess: () => {
                    toastSuccess('Sucesso', 'Cadastro realizado com sucesso');
                },
            },
        );
    };

    return (
        <AdminLayout>
            <Head title="Configurações" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Building} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Configurações</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                <div className="p-4">
                    <div className="rounded-lg border"></div>
                </div>
            </div>

            <div className="p-4">
                <div className="space-y-6">
                    <HeadingSmall title="Configurações de aparência" description="Altere a aparencia do sistema entre temas claro ou escuro." />
                    <AppearanceTabs />
                </div>

                <div className="my-10 w-24">
                    <img src={`/storage/logos/${settings.logo ? settings.logo : 'default.png'}`} alt="Imagem de logo" />
                </div>

                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
                    <div className="mt-4 flex flex-col gap-4 md:w-2xl">
                        <div className="grid gap-2">
                            <Label htmlFor="logo">Logotipo</Label>
                            <Input type="file" id="logo" onChange={(e) => setData('logo', e.target.files?.[0] ?? null)} />
                            {errors.logo && <div className="text-sm text-red-500">{errors.logo}</div>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome curto</Label>
                            <Input type="text" id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        </div>
                    </div>
                    <div className="flex justify-end md:w-2xl">
                        <Button type="submit" disabled={processing}>
                            <Save />
                            Salvar
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
