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
import { Pencil, Save } from "lucide-react"
import { useForm } from "@inertiajs/react"

export default function EditEquipment({equipment}:any) {
    const [open, setOpen] = useState(false)

    const { data, setData, processing, patch, errors, reset } = useForm({
        equipment: equipment.equipment,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        patch(route('app.register-equipments.update', equipment.id));
        setOpen(false);
    }
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
                        <DialogTitle>Editar Tipo de Equipamento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} autoComplete="off"autoComplete="off">
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nome">Nome do Equipamento *</Label>
                                <Input
                                    id="nome"
                                    value={data.equipment}
                                    onChange={(e) => setData("equipment", e.target.value)}
                                />
                                {errors.equipment && <div className="text-red-500 text-sm">{errors.equipment}</div>}
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
