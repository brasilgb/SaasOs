import AppPagination from '@/components/app-pagination';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin/admin-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ExternalLink, FileText, ReceiptText, RefreshCw, Settings } from 'lucide-react';
import moment from 'moment';

type AdminFiscalDocument = {
    id: number;
    type: string;
    provider: string;
    number?: string | null;
    status: string;
    amount: string | number;
    description?: string | null;
    pdf_url?: string | null;
    xml_url?: string | null;
    issued_at?: string | null;
    created_at?: string | null;
    tenant?: {
        id: number;
        company?: string | null;
        name?: string | null;
        cnpj?: string | null;
    };
    registered_by?: {
        name?: string | null;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Notas SaaS',
        href: '#',
    },
];

function money(value: string | number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

export default function AdminFiscalDocumentsIndex({ documents, settingConfigured }: { documents: any; settingConfigured: boolean }) {
    const handleSync = (document: AdminFiscalDocument) => {
        router.post(route('admin.fiscal-documents.sync', document.id), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Notas SaaS" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={ReceiptText} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Notas SaaS</h2>
                </div>
            </div>

            <div className="space-y-4 p-4">
                <div className="flex justify-end">
                    <Button variant="outline" asChild className="w-full whitespace-nowrap sm:w-auto">
                        <Link href={route('admin.fiscal-documents.settings')}>
                            <Settings className="h-4 w-4" />
                            Configurações fiscais
                        </Link>
                    </Button>
                </div>

                {!settingConfigured && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuração pendente</CardTitle>
                            <CardDescription>
                                Configure a integração fiscal do SaaS antes de emitir NFS-e para as empresas clientes.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Documentos fiscais emitidos pelo SaaS</CardTitle>
                        <CardDescription>Consulte NFS-e de assinatura/licenciamento emitidas para empresas clientes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Empresa</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Número</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Emissão</TableHead>
                                    <TableHead className="min-w-[140px] text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents?.data?.length > 0 ? (
                                    documents.data.map((document: AdminFiscalDocument) => (
                                        <TableRow key={document.id}>
                                            <TableCell>{document.type.toUpperCase()}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{document.tenant?.company || document.tenant?.name || '-'}</div>
                                                <div className="text-muted-foreground text-xs">{document.tenant?.cnpj || '-'}</div>
                                            </TableCell>
                                            <TableCell className="max-w-[320px] truncate">{document.description || '-'}</TableCell>
                                            <TableCell>{money(document.amount)}</TableCell>
                                            <TableCell>{document.number || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{document.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {document.issued_at
                                                    ? moment(document.issued_at).format('DD/MM/YYYY HH:mm')
                                                    : document.created_at
                                                      ? moment(document.created_at).format('DD/MM/YYYY HH:mm')
                                                      : '-'}
                                            </TableCell>
                                            <TableCell className="min-w-[140px]">
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    {document.provider === 'focus_nfe' && (
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            type="button"
                                                            onClick={() => handleSync(document)}
                                                            aria-label="Sincronizar com Focus NFe"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {document.pdf_url && (
                                                        <Button size="icon" variant="outline" asChild>
                                                            <a
                                                                href={document.pdf_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                aria-label="Abrir PDF"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    {document.xml_url && (
                                                        <Button size="icon" variant="outline" asChild>
                                                            <a
                                                                href={document.xml_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                aria-label="Abrir XML"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-16 text-center">
                                            Nenhuma nota fiscal SaaS registrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <AppPagination data={documents} />
            </div>
        </AdminLayout>
    );
}
