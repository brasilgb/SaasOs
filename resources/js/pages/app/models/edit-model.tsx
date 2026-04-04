import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { Pencil, Save } from 'lucide-react';
import { useState } from 'react';

export default function EditModel({ brands, model, page, search }: any) {
    const [open, setOpen] = useState(false);

    const { data, setData, processing, patch, errors, reset } = useForm({
        brand_id: model.brand_id,
        model: model.model,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        patch(route('app.register-models.update', model.id), {
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    const optionsBrand = brands.map((brand: any) => ({
        value: brand.id,
        label: brand.brand,
    }));

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button size={'icon'} className="bg-orange-500 text-white hover:bg-orange-600">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar Marca do Equipamento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="brand_id">Marca</Label>
                            <Select
                                onValueChange={(value) => setData('brand_id', value)}
                                defaultValue={`${data.brand_id}`}
                                value={`${data.brand_id}`}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione a marca" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {optionsBrand.map((opt: any) => (
                                            <SelectItem value={`${opt.value}`}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.brand_id && <div className="text-sm text-red-500">{errors.brand_id}</div>}
                        </div>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="model">Nome do Modelo *</Label>
                                <Input id="model" value={data.model} onChange={(e) => setData('model', e.target.value)} />
                                {errors.model && <div className="text-sm text-red-500">{errors.model}</div>}
                            </div>
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
        </div>
    );
}
