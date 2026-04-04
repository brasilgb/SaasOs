import { toastSuccess } from '@/components/app-toast-messages';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Cog, Save } from 'lucide-react';

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
    const { data, setData, patch, progress, processing, errors } = useForm({
        generatedbudget: whatsappmessage?.generatedbudget,
        servicecompleted: whatsappmessage?.servicecompleted,
        feedback: whatsappmessage?.feedback,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        patch(route('app.whatsapp-message.update', whatsappmessage?.id), {
            onSuccess: () => {
                toastSuccess('Sucesso', 'Mensagens para whatsapp ajustadas com sucesso');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Mensagens WhatsApp" />
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Cog} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Mensagens WhatsApp</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div></div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
                        <div className="mt-4 grid gap-4">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="generatedbudget">Orçamento gerado</Label>
                                <Textarea
                                    id="generatedbudget"
                                    value={data.generatedbudget}
                                    onChange={(e) => setData('generatedbudget', e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="servicecompleted">Serviço concluído</Label>
                                <Textarea
                                    id="servicecompleted"
                                    value={data.servicecompleted}
                                    onChange={(e) => setData('servicecompleted', e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="feedback">Feedback ao cliente</Label>
                                <Textarea id="feedback" value={data.feedback} onChange={(e) => setData('feedback', e.target.value)} />
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
