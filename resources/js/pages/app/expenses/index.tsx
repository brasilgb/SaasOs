import ActionDelete from '@/components/action-delete';
import AlertSuccess from '@/components/app-alert-success';
import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputError from '@/components/input-error';
import InputSearch from '@/components/inputSearch';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, OptionType } from '@/types';
import selectStyles from '@/Utils/selectStyles';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Edit, HandCoins, Plus } from 'lucide-react';
import moment from 'moment';
import { useRef, useState } from 'react';
import CreatableSelect from 'react-select/creatable';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
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
    const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount.toFixed(2) : '';
}

export default function Expenses({ expenses }: any) {
    const { flash, auth } = usePage().props as any;
    const [openModal, setOpenModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const canManageOrders = auth?.role !== 'technician' && auth?.permissions?.includes('orders');
    const initialCategoryOptions: OptionType[] = Array.from(
        new Set((expenses?.data ?? []).map((expense: Expense) => String(expense.category ?? '').trim()).filter(Boolean)),
    ).map((category) => ({ value: category, label: category }));
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

            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={HandCoins} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Despesas</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full">
                    <InputSearch placeholder="Buscar despesas por número, descrição e observação" url="app.expenses.index" />
                </div>
                <div className="flex w-full justify-end">
                    <Button variant="default" onClick={openCreateModal} className="w-full md:w-auto">
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
                                <TableHead>Descrição</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Lançado por</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses?.data?.length ? (
                                expenses.data.map((expense: Expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{expense.expense_number ?? '-'}</TableCell>
                                        <TableCell>{moment(expense.expense_date).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>{expense.description}</TableCell>
                                        <TableCell>{expense.category || '-'}</TableCell>
                                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
                                        <TableCell>{expense.created_by?.name ?? expense.createdBy?.name ?? '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button className="bg-orange-500 text-white hover:bg-orange-600" size="icon" onClick={() => openEditModal(expense)}>
                                                    <Edit className="mr-1 h-4 w-4" />
                                                </Button>
                                                {canManageOrders && <ActionDelete title={'esta despesa'} url={'app.expenses.destroy'} param={expense.id} />}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-16 text-center">
                                        Nenhuma despesa cadastrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={7}>
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
                                className="h-9 rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Observações</Label>
                            <Textarea id="notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} rows={3} />
                            <InputError message={form.errors.notes} />
                        </div>

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
