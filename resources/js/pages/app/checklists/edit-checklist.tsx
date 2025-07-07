import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Plus, Save } from "lucide-react"
import { useForm } from "@inertiajs/react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EditChecklist({ equipments, checklist }: any) {
    const [open, setOpen] = useState(false)

    const { data, setData, processing, patch, errors, reset } = useForm({
        equipment_id: checklist?.equipment_id,
        checklist: checklist?.checklist
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        patch(route('app.register-checklists.update', checklist.id), {
            onSuccess: () => {
                reset()
                setOpen(false)
            },
        });

    }
    
    const optionsEquipment = equipments.map((equipment: any) => ({
        value: equipment.id,
        label: equipment.equipment,
    }));

    const changeEquipment = (selected: any) => {
        setData('equipment_id', selected?.value);
    };

    const defaultEquipment = optionsEquipment?.filter((o: any) => o.value == checklist?.equipment_id).map((opt: any) => ({ value: opt.value, label: opt.label }));

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button size={'icon'} className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Cadastrar Checklist</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} autoComplete="off">

                        <div className="col-span-2 grid gap-2">
                            <Label htmlFor="customer_id">Equipamento</Label>
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
                            {errors.equipment_id && <div className="text-red-500 text-sm">{errors.equipment_id}</div>}
                        </div>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="checklist">Checklist *</Label>
                                <Input
                                    id="checklist"
                                    value={data.checklist}
                                    onChange={(e) => setData("checklist", e.target.value)}
                                />
                                {errors.checklist && <div className="text-red-500 text-sm">{errors.checklist}</div>}
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
    )
}
