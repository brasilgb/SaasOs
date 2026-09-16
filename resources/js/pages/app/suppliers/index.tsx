import ActionDelete from '@/components/action-delete';
import AlertSuccess from '@/components/app-alert-success';
import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import { Icon } from '@/components/icon';
import InputError from '@/components/input-error';
import InputSearch from '@/components/inputSearch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Building2, Edit, Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Painel', href: route('app.dashboard') },
    { title: 'Fornecedores', href: '#' },
];

type Supplier = {
    id: number;
    name: string;
    document?: string | null;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
    status: boolean;
};

type SupplierForm = {
    name: string;
    document: string;
    phone: string;
    email: string;
    notes: string;
    status: boolean;
};

export default function Suppliers({ suppliers }: any) {
    const { flash, auth } = usePage().props as any;
    const canManage = auth?.role !== 'technician' && auth?.permissions?.includes('suppliers');

    const [openModal, setOpenModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const form = useForm<SupplierForm>({
        name: '',
        document: '',
        phone: '',
        email: '',
        notes: '',
        status: true,
    });

    const openCreateModal = () => {
        setEditingSupplier(null);
        form.reset();
        form.clearErrors();
        setOpenModal(true);
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        form.clearErrors();
        form.setData({
            name: supplier.name ?? '',
            document: supplier.document ?? '',
            phone: supplier.phone ?? '',
            email: supplier.email ?? '',
            notes: supplier.notes ?? '',
            status: supplier.status,
        });
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
        setEditingSupplier(null);
        form.reset();
        form.clearErrors();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingSupplier) {
            form.put(route('app.suppliers.update', editingSupplier.id), { onSuccess: () => closeModal() });
            return;
        }

        form.post(route('app.suppliers.store'), { onSuccess: () => closeModal() });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {flash?.success && <AlertSuccess message={flash.success} />}
            <Head title="Fornecedores" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Building2} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Fornecedores</h2>
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full lg:max-w-[420px]">
                    <InputSearch placeholder="Buscar por nome, documento ou e-mail" url="app.suppliers.index" />
                </div>
                {canManage && (
                    <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:shrink-0 lg:justify-end">
                        <Button variant="default" onClick={openCreateModal} className="w-full whitespace-nowrap sm:w-auto">
                            <Plus className="h-4 w-4" />
                            <span>Novo fornecedor</span>
                        </Button>
                    </div>
                )}
            </div>

            <div className="p-4">
                <PaginationSummary data={suppliers} />
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Documento</TableHead>
                                <TableHead>Contato</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="min-w-[120px] text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suppliers?.data?.length ? (
                                suppliers.data.map((supplier: Supplier) => (
                                    <TableRow key={supplier.id}>
                                        <TableCell className="font-medium">{supplier.name}</TableCell>
                                        <TableCell>{supplier.document ?? '-'}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div>{supplier.phone ?? '-'}</div>
                                                <div className="text-muted-foreground">{supplier.email ?? '-'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    supplier.status
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                        : 'bg-muted text-muted-foreground'
                                                }
                                            >
                                                {supplier.status ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="min-w-[120px] text-right">
                                            {canManage && (
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <Button
                                                        className="bg-orange-500 text-white hover:bg-orange-600"
                                                        size="icon"
                                                        onClick={() => openEditModal(supplier)}
                                                        title="Editar fornecedor"
                                                        aria-label={`Editar fornecedor ${supplier.name}`}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <ActionDelete title={'este fornecedor'} url={'app.suppliers.destroy'} param={supplier.id} />
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-16 text-center">
                                        Nenhum fornecedor cadastrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <AppPagination data={suppliers} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>

            <Dialog open={openModal} onOpenChange={(open) => (!open ? closeModal() : setOpenModal(true))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSupplier ? 'Editar fornecedor' : 'Novo fornecedor'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Card>
                            <CardTitle className="border-b px-6 pb-4">Dados do fornecedor</CardTitle>
                            <CardContent className="space-y-4 pt-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nome</Label>
                                    <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                                    <InputError message={form.errors.name} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="document">CNPJ/CPF</Label>
                                        <Input id="document" value={form.data.document} onChange={(e) => form.setData('document', e.target.value)} />
                                        <InputError message={form.errors.document} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Telefone</Label>
                                        <Input id="phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                                        <InputError message={form.errors.phone} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input id="email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                                    <InputError message={form.errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Observações</Label>
                                    <Textarea id="notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} rows={3} />
                                    <InputError message={form.errors.notes} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch id="status" checked={form.data.status} onCheckedChange={(v) => form.setData('status', v)} />
                                    <Label htmlFor="status">Fornecedor ativo</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {editingSupplier ? 'Salvar alterações' : 'Salvar fornecedor'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
