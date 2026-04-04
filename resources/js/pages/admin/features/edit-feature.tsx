import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { Edit, Save } from 'lucide-react';
import { useState } from 'react';

interface Period {
    id: number;
    name: string;
}

interface Feature {
    id: number;
    name: string;
    period_id: number | string;
    order: number | string;
}

interface EditFeatureProps {
    feature: Feature;
    periods: Period[];
}

export default function EditFeature({ feature, periods }: EditFeatureProps) {
    const [open, setOpen] = useState(false);

    const { data, setData, patch, processing, errors } = useForm({
        name: feature.name,
        period_id: feature.period_id,
        order: feature.order,
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        patch(route('admin.features.update', feature.id), {
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-orange-500 text-white hover:bg-orange-600">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Cadastrar uma características</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input type="text" id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">Período</Label>
                        <Select onValueChange={(e) => setData('period_id', e)} defaultValue={`${data.period_id}`}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select um período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Fruits</SelectLabel>
                                    {periods.map((period) => (
                                        <SelectItem key={period.id} value={`${period.id}`}>
                                            {period.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.period_id && <div className="text-sm text-red-500">{errors.period_id}</div>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="order">Ordem</Label>
                        <Input type="number" id="order" value={data.order} onChange={(e) => setData('order', e.target.value)} />
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
