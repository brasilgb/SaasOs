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
import type { FormEvent } from 'react';

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

type WhatsappMessageSettings = {
    id?: number;
    generatedbudget?: string;
    servicecompleted?: string;
    feedback?: string;
    defaultmessage?: string;
};

const DEFAULT_MESSAGES = {
    generatedbudget:
        '{{ saudacao }}, {{ cliente }}!\n\nSeu orçamento da OS {{ ordem }} já está disponível.\n\nVocê pode acompanhar pelo link: {{ link_os }}\n\nSe tiver dúvidas, estamos à disposição.',
    servicecompleted:
        '{{ saudacao }}, {{ cliente }}!\n\nSua OS {{ ordem }} foi concluída com sucesso.\n\nVocê pode acompanhar pelo link: {{ link_os }}\n\nQualquer dúvida, conte com a gente.',
    feedback:
        '{{ saudacao }}, {{ cliente }}!\n\nEsperamos que tenha gostado do atendimento da OS {{ ordem }}.\n\nSeu feedback é muito importante para continuarmos melhorando.',
    defaultmessage:
        '{{ saudacao }}, {{ cliente }}!\n\nAtualização da sua OS {{ ordem }}.\n\nAcompanhe pelo link: {{ link_os }}\n\nQualquer dúvida, estamos à disposição.',
};

const previewValues = {
    cliente: 'João da Silva',
    ordem: '1024',
    link_os: 'https://seusite.com.br/os/abc123',
    saudacao: 'Boa tarde',
    saudação: 'Boa tarde',
};

const normalizePlaceholderKey = (key: string) =>
    key
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/-/g, '_');

const renderPreview = (template?: string) => {
    if (!template) return '';

    return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, key) => {
        const normalizedKey = normalizePlaceholderKey(String(key));

        if (normalizedKey === 'saudacao') {
            return previewValues.saudacao;
        }

        if (normalizedKey === 'cliente') {
            return previewValues.cliente;
        }

        if (normalizedKey === 'ordem') {
            return previewValues.ordem;
        }

        if (normalizedKey === 'link_os') {
            return previewValues.link_os;
        }

        return '';
    });
};

export default function WhatsappMessage({ whatsappmessage }: { whatsappmessage: WhatsappMessageSettings }) {
    const { data, setData, patch, processing } = useForm({
        generatedbudget: whatsappmessage?.generatedbudget,
        servicecompleted: whatsappmessage?.servicecompleted,
        feedback: whatsappmessage?.feedback,
        defaultmessage: whatsappmessage?.defaultmessage,
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        patch(route('app.whatsapp-message.update', whatsappmessage?.id), {
            onSuccess: () => {
                toastSuccess('Sucesso', 'Mensagens para whatsapp ajustadas com sucesso');
            },
        });
    };

    const handleResetDefaults = () => {
        setData('generatedbudget', DEFAULT_MESSAGES.generatedbudget);
        setData('servicecompleted', DEFAULT_MESSAGES.servicecompleted);
        setData('feedback', DEFAULT_MESSAGES.feedback);
        setData('defaultmessage', DEFAULT_MESSAGES.defaultmessage);
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
                            <div className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">
                                Você pode usar placeholders nas mensagens: <code>{'{{ cliente }}'}</code>, <code>{'{{ ordem }}'}</code>,{' '}
                                <code>{'{{ link_os }}'}</code>, <code>{'{{ saudacao }}'}</code>.
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="generatedbudget">Orçamento gerado</Label>
                                <Textarea
                                    id="generatedbudget"
                                    value={data.generatedbudget}
                                    onChange={(e) => setData('generatedbudget', e.target.value)}
                                />
                                <div className="text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap">
                                    Prévia: {renderPreview(data.generatedbudget)}
                                </div>
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="servicecompleted">Serviço concluído</Label>
                                <Textarea
                                    id="servicecompleted"
                                    value={data.servicecompleted}
                                    onChange={(e) => setData('servicecompleted', e.target.value)}
                                />
                                <div className="text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap">
                                    Prévia: {renderPreview(data.servicecompleted)}
                                </div>
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="feedback">Feedback ao cliente</Label>
                                <Textarea id="feedback" value={data.feedback} onChange={(e) => setData('feedback', e.target.value)} />
                                <div className="text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap">
                                    Prévia: {renderPreview(data.feedback)}
                                </div>
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="defaultmessage">Mensagem padrão (demais status)</Label>
                                <Textarea
                                    id="defaultmessage"
                                    value={data.defaultmessage}
                                    onChange={(e) => setData('defaultmessage', e.target.value)}
                                />
                                <div className="text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap">
                                    Prévia: {renderPreview(data.defaultmessage)}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleResetDefaults} disabled={processing}>
                                Restaurar modelos
                            </Button>
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
