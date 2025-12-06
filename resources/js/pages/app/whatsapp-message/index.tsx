import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { Cog, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AlertSuccess from "@/components/app-alert-success";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Mensagens Whatsapp',
        href: '#',
    },
];

export default function WhatsappMessage({ whatsappmessage }: any) {
    const { flash } = usePage().props as any;

    const { data, setData, patch, progress, processing, errors } = useForm({
        generatedbudget: whatsappmessage?.generatedbudget,
        servicecompleted: whatsappmessage?.servicecompleted,
        defaultmessage: whatsappmessage?.defaultmessage,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        patch(route('app.whatsapp-message.update', whatsappmessage?.id));
    }

    return (
        <AppLayout>
            {flash.message && <AlertSuccess message={flash.message} />}
            <Head title="Mensagens WhatsApp" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={Cog} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Mensagens WhatsApp</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className='flex items-center justify-between p-4'>
                <div>
                </div>
            </div>

            <div className='p-4'>
                <div className='border rounded-lg p-2'>

                    <form onSubmit={handleSubmit} autoComplete="off"className="space-y-8">
                        <div className="grid gap-4 mt-4">

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="generatedbudget">Orçamento gerado</Label>
                                <Textarea
                                    id="generatedbudget"
                                    value={data.generatedbudget}
                                    onChange={(e) => setData('generatedbudget', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="servicecompleted">Serviço concluído</Label>
                                <Textarea
                                    id="servicecompleted"
                                    value={data.servicecompleted}
                                    onChange={(e) => setData('servicecompleted', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="defaultmessage">Mensagem padrão</Label>
                                <Textarea
                                    id="defaultmessage"
                                    value={data.defaultmessage}
                                    onChange={(e) => setData('defaultmessage', e.target.value)}
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
            </div>
        </AppLayout>
    )
}
