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
import { Plus, Save } from "lucide-react"
import { useForm } from "@inertiajs/react"

export default function CreateEquipment() {
    const [open, setOpen] = useState(false)

    const { data, setData, processing, post, errors, reset } = useForm({
        equipment: '',
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        post(route('register-equipments.store'), {
            onSuccess: () => reset(),
        });

        setOpen(false);
    }
    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Equipamento
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Cadastrar Tipo do Equipamento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="equipment">Nome do Equipamento *</Label>
                                <Input
                                    id="equipment"
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
