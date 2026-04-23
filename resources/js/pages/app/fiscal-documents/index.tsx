import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ExternalLink, FileText, ReceiptText, Settings } from 'lucide-react';

type FiscalDocument = {
    id: number;
    documentable_type: string;
    documentable_id: number;
    type: string;
    provider: string;
    number?: string | null;
    status: string;
    pdf_url?: string | null;
    xml_url?: string | null;
    issued_at?: string | null;
    created_at?: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Notas fiscais',
        href: '#',
    },
];

function sourceLabel(provider: string) {
    return provider === 'manual' ? 'Manual' : 'Focus NFe';
}

function documentTargetLabel(document: FiscalDocument) {
    if (document.documentable_type.endsWith('\\Sale')) return `Venda #${document.documentable_id}`;
    if (document.documentable_type.endsWith('\\Order')) return `OS #${document.documentable_id}`;

    return `Registro #${document.documentable_id}`;
}

export default function FiscalDocuments({ documents = [] }: { documents?: FiscalDocument[] }) {
    return (
        <AppLayout>
            <Head title="Notas fiscais" />

            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={ReceiptText} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Notas fiscais</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="space-y-4 p-4">
                <div className="flex justify-end">
                    <Button variant="outline" asChild>
                        <Link href={route('app.fiscal-documents.settings')}>
                            <Settings className="h-4 w-4" />
                            Configurações fiscais
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Documentos fiscais</CardTitle>
                        <CardDescription>Consulte NF-e e NFS-e registradas manualmente ou emitidas por integração.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Origem</TableHead>
                                    <TableHead>Vínculo</TableHead>
                                    <TableHead>Número</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Emissão</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.length > 0 ? (
                                    documents.map((document) => (
                                        <TableRow key={document.id}>
                                            <TableCell>{document.type.toUpperCase()}</TableCell>
                                            <TableCell>{sourceLabel(document.provider)}</TableCell>
                                            <TableCell>{documentTargetLabel(document)}</TableCell>
                                            <TableCell>{document.number || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{document.status}</Badge>
                                            </TableCell>
                                            <TableCell>{document.issued_at ? new Date(document.issued_at).toLocaleDateString('pt-BR') : '-'}</TableCell>
                                            <TableCell className="flex justify-end gap-2">
                                                {document.pdf_url && (
                                                    <Button size="icon" variant="outline" asChild>
                                                        <a href={document.pdf_url} target="_blank" rel="noopener noreferrer" aria-label="Abrir PDF">
                                                            <FileText className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                                {document.xml_url && (
                                                    <Button size="icon" variant="outline" asChild>
                                                        <a href={document.xml_url} target="_blank" rel="noopener noreferrer" aria-label="Abrir XML">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-16 text-center">
                                            Nenhuma nota fiscal registrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
