import AlertSuccess from '@/components/app-alert-success'
import AppearanceTabs from '@/components/appearance-tabs'
import { Breadcrumbs } from '@/components/breadcrumbs'
import HeadingSmall from '@/components/heading-small'
import { Icon } from '@/components/icon'
import InputSearch from '@/components/inputSearch'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types'
import apios from '@/Utils/connectApi'
import { maskCpfCnpj } from '@/Utils/mask'
import { Head, useForm, usePage } from '@inertiajs/react'
import { HardDriveUpload, Save, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/',
    },
    {
        title: 'Outras configurações',
        href: '/others',
    },
];

export default function Others({ othersettings, customers, orders, company }: any) {
    const [loading, setLoading] = useState<boolean>(false);
    const [loading1, setLoading1] = useState<boolean>(false);
    const [uploading, setUploading] = useState<string>('');

    const { flash } = usePage().props as any;
    const { data, setData, put, processing } = useForm({
        navigation: othersettings?.navigation,
        budget: othersettings?.budget,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        put(route('other-settings.update', othersettings?.id));
    }


    const pushOrders = async () => {
        setLoading(true);
        await apios.post('insert-order', {
            orders: orders
        })
            .then((res) => {
                setUploading(res.data.response.message);
            })
            .catch((err) => {
                console.log(err.message);
            }).finally(() => setLoading(false));
    }

    const pushUsers = async () => {
        setLoading1(true);
        await apios.post('insert-user', {
            customers: customers
        })
            .then((res) => {
                setUploading(res.data.response.message);
            })
            .catch((err) => {
                console.log(err.message);
            }).finally(() => setLoading1(false));
    }

    useEffect(() => {
        if (uploading) {
            setTimeout(() => {
                setUploading('');
            }, 3000);
        }
    }, [uploading]);

    return (
        <AppLayout>
            {flash.message && <AlertSuccess message={flash.message} />}
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
                    title="Licença de uso" 
                    description={`Este software é licenciado para a empresa ${company?.companyname}, CNPJ: ${maskCpfCnpj(company?.cnpj)}. Localizada na ${company?.street}, ${company?.number}, ${company?.district}, ${company?.city} - ${company?.state}.`} 
                    />

                </div>

                <div className="space-y-6">
                    <HeadingSmall title="Configurações de aparência" description="Altere a aparencia do sistema entre temas claro ou escuro." />
                    <AppearanceTabs />
                </div>
                <div className="space-y-6 mt-6">
                    <HeadingSmall title="Dados para área do cliente do site" description="Insere os dados do cliente e de suas ordens de serviço a área do cliente no site da empresa." />
                    <div className="flex items-center justify-start gap-2">
                        <Button
                            onClick={() => pushUsers()}
                        >
                            <HardDriveUpload />
                            {loading1 ? 'Inserindo clientes...' : 'Insere clientes'}
                        </Button>
                        <Button
                            onClick={() => pushOrders()}
                        >
                            <HardDriveUpload />
                            {loading ? 'Inserindo ordens...' : 'Insere ordens'}
                        </Button>
                    </div>
                    {uploading && <AlertSuccess message={uploading} className='!p-0' />}
                </div>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6 mt-6">
                        <HeadingSmall title="Configuração de navegação" description="Altere entre o menu de navegação no topo e a barra de navegação lateral Sidebar." />
                        <div className="grid gap-2">
                            <Switch
                                id="navigation"
                                checked={data.navigation}
                                onCheckedChange={(checked: any) => setData('navigation', checked)}
                            />
                        </div>
                    </div>
                    <div className="space-y-6 mt-6">
                        <HeadingSmall title="Habilitar pré-orçamento Tablet" description="Habilita as opções no cadastro para o uso dos orçamentos pré-gerados no auto atendimento no tablet." />
                        <div className="grid gap-2">
                            <Switch
                                id="budget"
                                checked={data.budget}
                                onCheckedChange={(checked: any) => setData('budget', checked)}
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
