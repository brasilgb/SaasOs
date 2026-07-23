import { toastSuccess } from '@/components/app-toast-messages';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin/admin-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Cog, Save } from 'lucide-react';

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
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Configurações" />
            <div className="flex min-h-16 w-full flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Cog} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Configurações</h2>
                </div>
            </div>

            <div className="w-full p-4">
                <div className="bg-card w-full rounded-2xl border p-5 shadow-sm sm:p-6">
                    <form onSubmit={handleSubmit} autoComplete="off" className="w-full space-y-8">
                        <div className="space-y-3">
                            <Label>Imagem de logo</Label>
                            <div className="bg-muted/30 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border p-3">
                                <img
                                    src={settings.logo ? `/storage/logos/${settings.logo}` : '/images/default.png'}
                                    alt="Imagem de logo"
                                    className="max-h-full max-w-full object-contain"
                                    onError={(event) => {
                                        event.currentTarget.src = '/images/default.png';
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid w-full gap-4 xl:grid-cols-2">
                            <div className="grid gap-2 xl:col-span-2">
                                <Label htmlFor="logo">Logotipo</Label>
                                <Input type="file" id="logo" onChange={(e) => setData('logo', e.target.files?.[0] ?? null)} />
                                {errors.logo && <div className="text-sm text-red-500">{errors.logo}</div>}
                            </div>

                            <div className="grid gap-2 xl:max-w-md">
                                <Label htmlFor="name">Nome curto</Label>
                                <Input type="text" id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            </div>
                        </div>

                        <div className="flex w-full justify-end">
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
