import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { Pencil, Save } from 'lucide-react';
import { useState } from 'react';

export default function EditService({ equipments, service, page, search }: any) {
    const [open, setOpen] = useState(false);

    const { data, setData, processing, patch, errors, reset } = useForm({
        equipment_id: service?.equipment_id,
        service: service?.service,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        patch(route('app.register-services.update', service.id), {
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    const optionsEquipment = equipments.map((equipment: any) => ({
        value: equipment.id,
        label: equipment.equipment,
    }));

    const changeEquipment = (selected: any) => {
        setData('equipment_id', selected?.value);
    };

    const defaultEquipment = optionsEquipment
        ?.filter((o: any) => o.value == service?.equipment_id)
        .map((opt: any) => ({ value: opt.value, label: opt.label }));

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
                        <DialogTitle>Cadastrar Serviço</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="equipment_id">Serviço</Label>
                            <Select
                                onValueChange={(value) => setData('equipment_id', value)}
                                defaultValue={`${data.equipment_id}`}
                                value={`${data.equipment_id}`}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o equipamento" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {optionsEquipment.map((opt: any) => (
                                            <SelectItem value={`${opt.value}`}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.equipment_id && <div className="text-sm text-red-500">{errors.equipment_id}</div>}
                        </div>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="service">Serviço *</Label>
                                <Input id="service" value={data.service} onChange={(e) => setData('service', e.target.value)} />
                                {errors.service && <div className="text-sm text-red-500">{errors.service}</div>}
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
