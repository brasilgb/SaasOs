import AlertSuccess from '@/components/app-alert-success'
import { toastSuccess } from '@/components/app-toast-messages'
import AppearanceTabs from '@/components/appearance-tabs'
import { Breadcrumbs } from '@/components/breadcrumbs'
import HeadingSmall from '@/components/heading-small'
import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types'
import { maskCpfCnpj } from '@/Utils/mask'
import { Head, useForm, usePage } from '@inertiajs/react'
import { Save, Wrench } from 'lucide-react';
import { useState } from 'react'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Outras configurações',
        href: '#',
    },
];

export default function Others({ othersettings, company, time_remaining }: any) {
const { auth } = usePage().props as any;
    const [uploading, setUploading] = useState<string>('');
    const { data, setData, put, processing } = useForm({
        navigation: othersettings?.navigation,
        budget: othersettings?.budget,
        enableparts: othersettings?.enableparts,
        enablesales: othersettings?.enablesales,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        put(route('app.other-settings.update', othersettings?.id), {
            onSuccess: () => {
                toastSuccess("Sucesso", "Configuração ajustada com sucesso")
            },
        });
    }

    return (
        <AppLayout>
            
            <Head title="Outras configurações" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={Wrench} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Outras configurações</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className='p-4'>
                <div className="space-y-6 mb-6">
                    <HeadingSmall
                        title="Licença de uso do sistema"
                        description={`Este software é licenciado para a empresa ${company?.companyname}, CNPJ: ${maskCpfCnpj(company?.cnpj)}. Localizada na ${company?.street}, ${company?.number}, ${company?.district}, ${company?.city} - ${company?.state}.`}
                        license={auth?.plan}
                        time_remaining={time_remaining}
                    />
                </div>

                <div className="space-y-6">
                    <HeadingSmall title="Configurações de aparência" description="Altere a aparencia do sistema entre temas claro ou escuro." />
                    <AppearanceTabs />
                </div>
                {/* <div className="space-y-6 mt-6">
                    <HeadingSmall title="Dados para área do cliente do site" description="Insere os dados do cliente e de suas ordens de serviço a área do cliente no site da empresa." />

                    {uploading && <AlertSuccess message={uploading} className='!p-0' />}
                </div> */}
                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
                    {/* <div className="space-y-6 mt-6">
                        <HeadingSmall title="Configuração de navegação" description="Altere entre o menu de navegação lateral Sidebar e a barra de navegação no topo." />
                        <div className="grid gap-2">
                            <Switch
                                id="navigation"
                                checked={data.navigation}
                                onCheckedChange={(checked: any) => setData('navigation', checked)}
                            />
                        </div>
                    </div> */}
                    <div className="space-y-6 mt-6">
                        <HeadingSmall title="Habilitar cadastro e utilização de estoque de peças e/ou produtos " description="Habilita a opções de cadastro e a utilização de inserção de peças e/ou produtos nas ordens de serviço. Padrão inserção manual do nome e valor." />
                        <div className="grid gap-2">
                            <Switch
                                id="enableparts"
                                checked={data.enableparts}
                                onCheckedChange={(checked: any) => setData('enableparts', checked)}
                            />
                        </div>
                    </div>
                    <div className="space-y-6 mt-6">
                        <HeadingSmall title="Habilitar a venda de peças e/ou produtos" description="Habilitar a venda de peças e/ou produtos avulsos ou para usuários específicos, com ajuste de estoque." />
                        <div className="grid gap-2">
                            <Switch
                                id="enablesales"
                                checked={data.enablesales}
                                onCheckedChange={(checked: any) => setData('enablesales', checked)}
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
        </AppLayout>
    )
}
