import { toastSuccess } from '@/components/app-toast-messages';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, usePage } from '@inertiajs/react';
import { Pencil, Save } from 'lucide-react';
import { useState } from 'react';
import EquipmentTypesModal from '../orders/equipment-types-modal';

export default function EditChecklist({ equipments, checklist, returnTo }: any) {
    const { auth } = usePage<{ auth?: { permissions?: string[] } }>().props;
    const canManageEquipments = auth?.permissions?.includes('register_equipments');
    const [open, setOpen] = useState(false);

    const { data, setData, processing, patch, errors } = useForm({
        equipment_id: checklist?.equipment_id,
        checklist: checklist?.checklist,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        patch(route('app.register-checklists.update', { checklist: checklist.id, ...(returnTo ? { return_to: returnTo } : {}) }), {
            onSuccess: () => {
                (toastSuccess('Sucesso', 'Edição realizada com sucesso'), setOpen(false));
            },
        });
    };

    const optionsEquipment = equipments.map((equipment: any) => ({
        value: equipment.id,
        label: equipment.equipment,
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
                        <DialogTitle>Cadastrar Checklist</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="customer_id">Equipamento</Label>
                            <div className="flex min-w-0 items-center gap-2">
                                <Select onValueChange={(value) => setData('equipment_id', value)} value={`${data.equipment_id}`}>
                                    <SelectTrigger className="min-w-0 flex-1">
                                        <SelectValue placeholder="Selecione o equipamento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {optionsEquipment.map((opt: any) => (
                                                <SelectItem key={opt.value} value={`${opt.value}`}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {canManageEquipments && (
                                    <EquipmentTypesModal
                                        equipments={equipments}
                                        selectedEquipmentId={data.equipment_id}
                                        onSelectEquipment={(equipmentId) => setData('equipment_id', equipmentId)}
                                    />
                                )}
                            </div>
                            {errors.equipment_id && <div className="text-sm text-red-500">{errors.equipment_id}</div>}
                        </div>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="checklist">Checklist Checklist (separar com vírgula)</Label>
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
