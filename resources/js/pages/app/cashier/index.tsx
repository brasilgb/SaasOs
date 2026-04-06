import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import CashierDailyReportPDF from '@/pages/app/reports/pdf/CashierDailyReportPDF';
import { BreadcrumbItem } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head, useForm, usePage } from '@inertiajs/react';
import { pdf } from '@react-pdf/renderer';
import { FileText, HandCoins, Loader2 } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Caixa diário',
        href: '#',
    },
];

const money = (value: number | string | null | undefined) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

export default function CashierIndex({ currentSession, sessions, openTotals }: any) {
    const { company } = usePage().props as any;
    const openForm = useForm({
        opening_balance: '',
        notes: '',
    });

    const closeForm = useForm({
        closing_balance: '',
        manual_entries: '',
        manual_exits: '',
        closing_notes: '',
    });
    const [loadingPdfId, setLoadingPdfId] = useState<number | null>(null);

    const handleOpen = (e: any) => {
        e.preventDefault();
        openForm.post(route('app.cashier.open'));
    };

    const handleClose = (e: any) => {
        e.preventDefault();

        if (!String(closeForm.data.closing_balance ?? '').trim()) {
            closeForm.setError('closing_balance', 'Informe o saldo contado para fechar o caixa.');
            return;
        }

        closeForm.post(route('app.cashier.close', currentSession.id));
    };

    const handleGeneratePDF = async (session: any) => {
        if (!session || session.status !== 'closed') return;

        setLoadingPdfId(session.id);
        try {
            const blob = await pdf(<CashierDailyReportPDF session={session} company={company} />).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Erro ao gerar PDF de fechamento diário:', error);
            alert('Erro ao gerar o PDF de fechamento diário.');
        } finally {
            setLoadingPdfId(null);
        }
    };

    return (
        <AppLayout>
            <Head title="Caixa diário" />

            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={HandCoins} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Caixa diário</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="grid gap-4 p-4 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardDescription>Status atual</CardDescription>
                        <CardTitle>{currentSession ? 'Caixa aberto' : 'Caixa fechado'}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        {currentSession ? (
                            <div className="space-y-1">
                                <div>Abertura: {moment(currentSession.opened_at).format('DD/MM/YYYY HH:mm')}</div>
                                <div>Saldo inicial: {money(currentSession.opening_balance)}</div>
                                <div>Vendas (aberto): {money(openTotals?.completed_sales)}</div>
                                <div>Pagamentos de OS: {money(openTotals?.order_payments)}</div>
                                <div>Total recebido: {money(openTotals?.total_received)}</div>
                            </div>
                        ) : (
                            <div>Nenhum caixa aberto no momento.</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{currentSession ? 'Fechar caixa' : 'Abrir caixa'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!currentSession ? (
                            <form onSubmit={handleOpen} className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="opening_balance">Saldo inicial</Label>
                                    <Input
                                        id="opening_balance"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0,00"
                                        value={openForm.data.opening_balance}
                                        onChange={(e) => openForm.setData('opening_balance', maskMoney(e.target.value))}
                                    />
                                    <InputError message={openForm.errors.opening_balance} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="notes">Observações</Label>
                                    <Textarea id="notes" value={openForm.data.notes} onChange={(e) => openForm.setData('notes', e.target.value)} />
                                    <InputError message={openForm.errors.notes} />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <Button type="submit" disabled={openForm.processing}>
                                        Abrir caixa
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleClose} className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="closing_balance">Saldo contado no fechamento</Label>
                                    <Input
                                        id="closing_balance"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0,00"
                                        value={closeForm.data.closing_balance}
                                        onChange={(e) => {
                                            closeForm.clearErrors('closing_balance');
                                            closeForm.setData('closing_balance', maskMoney(e.target.value));
                                        }}
                                    />
                                    <InputError message={closeForm.errors.closing_balance} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="manual_entries">Entradas manuais</Label>
                                    <Input
                                        id="manual_entries"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0,00"
                                        value={closeForm.data.manual_entries}
                                        onChange={(e) => closeForm.setData('manual_entries', maskMoney(e.target.value))}
                                    />
                                    <InputError message={closeForm.errors.manual_entries} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="manual_exits">Saídas manuais</Label>
                                    <Input
                                        id="manual_exits"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0,00"
                                        value={closeForm.data.manual_exits}
                                        onChange={(e) => closeForm.setData('manual_exits', maskMoney(e.target.value))}
                                    />
                                    <InputError message={closeForm.errors.manual_exits} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="closing_notes">Observações do fechamento</Label>
                                    <Textarea
                                        id="closing_notes"
                                        value={closeForm.data.closing_notes}
                                        onChange={(e) => closeForm.setData('closing_notes', e.target.value)}
                                    />
                                    <InputError message={closeForm.errors.closing_notes} />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <Button type="submit" disabled={closeForm.processing}>
                                        Fechar caixa
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Abertura</TableHead>
                                <TableHead>Fechamento</TableHead>
                                <TableHead>Saldo inicial</TableHead>
                                <TableHead>Saldo esperado</TableHead>
                                <TableHead>Saldo contado</TableHead>
                                <TableHead>Diferença</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions?.data?.length ? (
                                sessions.data.map((session: any) => (
                                    <TableRow key={session.id}>
                                        <TableCell>{session.id}</TableCell>
                                        <TableCell>
                                            {session.status === 'open' ? <Badge>Aberto</Badge> : <Badge variant="secondary">Fechado</Badge>}
                                        </TableCell>
                                        <TableCell>{moment(session.opened_at).format('DD/MM/YYYY HH:mm')}</TableCell>
                                        <TableCell>{session.closed_at ? moment(session.closed_at).format('DD/MM/YYYY HH:mm') : '-'}</TableCell>
                                        <TableCell>{money(session.opening_balance)}</TableCell>
                                        <TableCell>{money(session.expected_balance)}</TableCell>
                                        <TableCell>{money(session.closing_balance)}</TableCell>
                                        <TableCell>{money(session.difference)}</TableCell>
                                        <TableCell className="flex justify-end">
                                            {session.status === 'closed' && (
                                                <Button
                                                    type="button"
                                                    onClick={() => handleGeneratePDF(session)}
                                                    disabled={loadingPdfId === session.id}
                                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                                >
                                                    {loadingPdfId === session.id ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
                                                    Relatório PDF
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center">
                                        Nenhum fechamento registrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
