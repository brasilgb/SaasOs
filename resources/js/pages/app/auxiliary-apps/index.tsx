import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Download, Image, MessageSquareText, Smartphone, Wrench } from 'lucide-react';

type AuxiliaryApp = {
    name: string;
    filename: string;
    description: string;
    url: string;
    available: boolean;
    size: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Painel',
        href: route('app.dashboard'),
    },
    {
        title: 'Aplicativos auxiliares',
        href: route('app.auxiliary-apps.index'),
    },
];

const appIcons = {
    'vetor-imagem.apk': Image,
    'vetor-atendimento.apk': MessageSquareText,
    'vetor-tecnico.apk': Wrench,
};

export default function AuxiliaryApps({ apps }: { apps: AuxiliaryApp[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Aplicativos auxiliares" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Smartphone} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Aplicativos auxiliares</h2>
                </div>
                <p className="text-muted-foreground text-sm">Baixe os aplicativos Android que complementam a operação do VetorOS.</p>
            </div>

            <div className="p-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {apps.map((app) => {
                        const AppIcon = appIcons[app.filename as keyof typeof appIcons] ?? Smartphone;

                        return (
                            <Card key={app.filename} className="h-full">
                                <CardHeader>
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                                            <AppIcon className="size-6" />
                                        </div>
                                        <Badge variant={app.available ? 'secondary' : 'outline'}>
                                            {app.available ? 'Disponível' : 'Aguardando APK'}
                                        </Badge>
                                    </div>
                                    <CardTitle>{app.name}</CardTitle>
                                    <CardDescription>{app.description}</CardDescription>
                                </CardHeader>

                                <CardContent className="mt-auto space-y-1 text-sm">
                                    <p className="text-muted-foreground">
                                        Arquivo: <span className="text-foreground font-medium">{app.filename}</span>
                                    </p>
                                    {app.size && <p className="text-muted-foreground">Tamanho: {app.size}</p>}
                                </CardContent>

                                <CardFooter>
                                    {app.available ? (
                                        <Button asChild className="w-full">
                                            <a href={app.url} download={app.filename}>
                                                <Download className="size-4" />
                                                Baixar APK
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button className="w-full" disabled>
                                            <Download className="size-4" />
                                            APK não disponível
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
