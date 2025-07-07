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

export default function EditBrand({brand}:any) {
    const [open, setOpen] = useState(false)

    const { data, setData, processing, patch, errors, reset } = useForm({
        brand: brand.brand,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        patch(route('app.register-brands.update', brand.id));
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
                        <DialogTitle>Editar Marca do Equipamento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nome">Nome da Marca *</Label>
                                <Input
                                    id="nome"
                                    value={data.brand}
                                    onChange={(e) => setData("brand", e.target.value)}
                                />
                                {errors.brand && <div className="text-red-500 text-sm">{errors.brand}</div>}
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
