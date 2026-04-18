import { toastSuccess } from '@/components/app-toast-messages';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createSlug, maskMoney, maskMoneyDot } from '@/Utils/mask';
import { useForm } from '@inertiajs/react';
import { Plus, Save } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

export default function CreatePlan() {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        value: '0.00',
        billing_months: '1',
    });

    const handleSlug = (slug: string) => {
        const creSlug = createSlug(slug) ?? '';
        setData('name', slug);
        setData('slug', creSlug);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('admin.plans.store'), {
            onSuccess: () => {
                toastSuccess('Sucesso', 'Cadastro realizado com sucesso');
                reset();
                setOpen(false);
            },
        });
    };

    useEffect(() => {
        setData('value', maskMoneyDot(data.value) ?? '');
    }, [data.value]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Plano
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Cadastrar um plano</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input type="text" id="name" value={data.name} onChange={(e) => handleSlug(e.target.value)} />
                        {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input type="text" id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
                        {errors.slug && <div className="text-sm text-red-500">{errors.slug}</div>}
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        {errors.description && <div className="text-sm text-red-500">{errors.description}</div>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="value">Valor</Label>
                        <Input type="text" id="value" value={maskMoney(data.value)} onChange={(e) => setData('value', e.target.value)} />
                        {errors.value && <div className="text-sm text-red-500">{errors.value}</div>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="billing_months">Ciclo de cobrança</Label>
                        <select
                            id="billing_months"
                            value={data.billing_months}
                            onChange={(e) => setData('billing_months', e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="1">Mensal</option>
                            <option value="3">Trimestral</option>
                            <option value="6">Semestral</option>
                            <option value="12">Anual</option>
                        </select>
                        {errors.billing_months && <div className="text-sm text-red-500">{errors.billing_months}</div>}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save />
                            Salvar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
