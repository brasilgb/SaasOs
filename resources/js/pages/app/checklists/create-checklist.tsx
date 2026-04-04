import { toastSuccess } from '@/components/app-toast-messages';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { Plus, Save } from 'lucide-react';
import { useState } from 'react';

export default function CreateChecklist({ equipments }: any) {
    const [open, setOpen] = useState(false);

    const { data, setData, processing, post, errors, reset } = useForm({
        equipment_id: '',
        checklist: '',
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        post(route('app.register-checklists.store'), {
            onSuccess: () => {
                (toastSuccess('Sucesso', 'Cadastro realizado com sucesso'), reset(), setOpen(false));
            },
        });
    };

    const optionsEquipment = equipments.map((equipment: any) => ({
        value: equipment.id,
        label: equipment.equipment,
    }));

    const changeEquipment = (selected: any) => {
        setData('equipment_id', selected);
    };

    return (
        <div className="w-full md:w-auto">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full gap-2">
                        <Plus className="h-4 w-4" />
                        <span>Novo Checklist</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Cadastrar Checklist</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="customer_id">Equipamento</Label>
                            <Select onValueChange={(value) => setData('equipment_id', value)} defaultValue={data.equipment_id}>
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
                                <Label htmlFor="checklist">Checklist (separar com vírgula)</Label>
                                <Input
                                    placeholder="Check1, Check2, Check3"
                                    id="checklist"
                                    value={data.checklist}
                                    onChange={(e) => setData('checklist', e.target.value)}
                                />
                                {errors.checklist && <div className="text-sm text-red-500">{errors.checklist}</div>}
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
