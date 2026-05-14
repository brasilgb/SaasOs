import ActionDelete from '@/components/action-delete';
import AlertSuccess from '@/components/app-alert-success';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputError from '@/components/input-error';
import InputSearch from '@/components/inputSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, OptionType } from '@/types';
import selectStyles from '@/Utils/selectStyles';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BanknoteArrowDownIcon, Edit, Plus } from 'lucide-react';
import moment from 'moment';
import { useRef, useState } from 'react';
import CreatableSelect from 'react-select/creatable';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Painel', href: route('app.dashboard') },
    { title: 'Despesas', href: '#' },
];

type Expense = {
    id: number;
    expense_number?: number;
    expense_date: string;
    description: string;
    category?: string;
    amount: number;
    notes?: string;
    created_by?: { id: number; name: string };
    createdBy?: { id: number; name: string };
};

type ExpenseForm = {
    expense_date: string;
    description: string;
    category: string;
    amount: string;
    notes: string;
};

function formatCurrency(value: number | string) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCurrencyMask(value: string) {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const number = Number(digits) / 100;
    return number.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function parseCurrencyMask(value: string) {
    const normalized = value
        .replace(/\./g, '')
        .replace(',', '.')
        .replace(/[^\d.]/g, '');
    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount.toFixed(2) : '';
}

export default function Expenses({ expenses }: any) {
    const { flash, auth } = usePage().props as any;
    const [openModal, setOpenModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const canManageOrders = auth?.role !== 'technician' && auth?.permissions?.includes('orders');
    const initialCategoryOptions: OptionType[] = Array.from(
        new Set<string>((expenses?.data ?? []).map((expense: Expense) => String(expense.category ?? '').trim()).filter(Boolean)),
    ).map((category): OptionType => ({ value: category, label: category }));
    const [categoryOptions, setCategoryOptions] = useState<OptionType[]>(initialCategoryOptions);
    const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(null);
    const [amountDisplay, setAmountDisplay] = useState('');
    const expenseDateRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<ExpenseForm>({
        expense_date: moment().format('YYYY-MM-DD'),
        description: '',
        category: '',
        amount: '',
        notes: '',
    });

    const resetForm = () => {
        form.reset();
        form.clearErrors();
        form.setData('expense_date', moment().format('YYYY-MM-DD'));
        form.setData('amount', '');
        setAmountDisplay('');
        setSelectedCategory(null);
    };

    const openCreateModal = () => {
        setEditingExpense(null);
        resetForm();
        setOpenModal(true);
    };

    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        form.clearErrors();
        const categoryValue = (expense.category ?? '').trim();
        const option = categoryValue ? { value: categoryValue, label: categoryValue } : null;
        if (option && !categoryOptions.some((item) => item.value === option.value)) {
            setCategoryOptions((prev) => [...prev, option]);
        }
        setSelectedCategory(option);
        form.setData({
            expense_date: moment(expense.expense_date).format('YYYY-MM-DD'),
            description: expense.description ?? '',
            category: categoryValue,
            amount: Number(expense.amount ?? 0).toFixed(2),
            notes: expense.notes ?? '',
        });
        setAmountDisplay(
            Number(expense.amount || 0).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        );
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
        setEditingExpense(null);
        resetForm();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingExpense) {
            form.put(route('app.expenses.update', editingExpense.id), {
                onSuccess: () => closeModal(),
            });
            return;
        }

        form.post(route('app.expenses.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const changeCategory = (option: OptionType | null) => {
        setSelectedCategory(option);
        form.setData('category', option ? String(option.value) : '');
    };

    const createCategory = (value: string) => {
        const category = value.trim();
        if (!category) return;

        const option = { value: category, label: category };
        if (!categoryOptions.some((item) => item.value === option.value)) {
            setCategoryOptions((prev) => [...prev, option]);
        }
        setSelectedCategory(option);
        form.setData('category', category);
    };

    const onAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const masked = formatCurrencyMask(event.target.value);
        setAmountDisplay(masked);
        form.setData('amount', parseCurrencyMask(masked));
    };

    return (
        <AppLayout>
            {flash?.success && <AlertSuccess message={flash.success} />}
            <Head title="Despesas" />

            <div className="flex min-h-16 flex-col justify-center gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
                <div className="flex items-center gap-2">
                    <Icon iconNode={BanknoteArrowDownIcon} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Despesas</h2>
                </div>
                <div className="min-w-0 self-start sm:self-auto">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full lg:flex-none">
                    <InputSearch placeholder="Buscar despesas por número, descrição e observação" url="app.expenses.index" className="lg:w-[420px]" />
                </div>
                <div className="flex w-full justify-end lg:w-auto lg:flex-none">
                    <Button variant="default" onClick={openCreateModal} className="w-full whitespace-nowrap sm:w-auto">
                        <Plus className="h-4 w-4" />
                        <span>Nova despesa</span>
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Despesa</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Lançado por</TableHead>
                                <TableHead className="min-w-[120px] text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses?.data?.length ? (
                                expenses.data.map((expense: Expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{expense.expense_number ?? '-'}</TableCell>
                                        <TableCell>{moment(expense.expense_date).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{expense.description}</div>
                                                <div className="text-muted-foreground text-xs">{expense.category || 'Sem categoria'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
                                        <TableCell>{expense.created_by?.name ?? expense.createdBy?.name ?? '-'}</TableCell>
                                        <TableCell className="min-w-[120px] text-right">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <Button
                                                    className="bg-orange-500 text-white hover:bg-orange-600"
                                                    size="icon"
                                                    onClick={() => openEditModal(expense)}
                                                    title="Editar despesa"
                                                    aria-label={`Editar despesa ${expense.expense_number ?? expense.description}`}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {canManageOrders && (
                                                    <ActionDelete title={'esta despesa'} url={'app.expenses.destroy'} param={expense.id} />
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-16 text-center">
                                        Nenhuma despesa cadastrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <AppPagination data={expenses} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>

            <Dialog open={openModal} onOpenChange={(open) => (!open ? closeModal() : setOpenModal(true))}>
                <DialogContent
                    onOpenAutoFocus={(event) => {
                        event.preventDefault();
                        setTimeout(() => expenseDateRef.current?.focus(), 0);
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>{editingExpense ? 'Editar despesa' : 'Nova despesa'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Card>
                            <CardTitle className="border-b px-6 pb-4">Dados da despesa</CardTitle>
                            <CardContent className="space-y-4 pt-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="expense_date">Data</Label>
                                    <Input
                                        id="expense_date"
                                        type="date"
                                        ref={expenseDateRef}
                                        value={form.data.expense_date}
                                        onChange={(e) => form.setData('expense_date', e.target.value)}
                                    />
                                    <InputError message={form.errors.expense_date} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Descrição</Label>
                                    <Input
                                        id="description"
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        placeholder="Ex: Conta de energia"
                                    />
                                    <InputError message={form.errors.description} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="category">Categoria</Label>
                                    <CreatableSelect<OptionType, false>
                                        value={selectedCategory}
                                        options={categoryOptions}
                                        onChange={changeCategory}
                                        onCreateOption={createCategory}
                                        isClearable
                                        styles={selectStyles}
                                        placeholder="Selecione ou digite a nova categoria"
                                        classNamePrefix="creatable-select"
                                        className="min-w-0"
                                        formatCreateLabel={(inputValue) => `Criar "${inputValue}"`}
                                    />
                                    <InputError message={form.errors.category} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Valor</Label>
                                    <Input
                                        id="amount"
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0,00"
                                        value={amountDisplay}
                                        onChange={onAmountChange}
                                    />
                                    <InputError message={form.errors.amount} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardTitle className="border-b px-6 pb-4">Observações</CardTitle>
                            <CardContent className="pt-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Observações</Label>
                                    <Textarea id="notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} rows={3} />
                                    <InputError message={form.errors.notes} />
                                </div>
                            </CardContent>
                        </Card>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {editingExpense ? 'Salvar alterações' : 'Salvar despesa'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
