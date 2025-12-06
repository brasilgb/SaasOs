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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateModel({ brands }: any) {
    const [open, setOpen] = useState(false)

    const { data, setData, processing, post, errors, reset } = useForm({
        brand_id: '',
        model: ''
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        post(route('app.register-models.store'), {
            onSuccess: () => {
                reset()
                setOpen(false)
            },
        });

    }

    const optionsBrand = brands.map((brand: any) => ({
        value: brand.id,
        label: brand.brand,
    }));

    const changeCustomer = (selected: any) => {
        setData('brand_id', selected?.value);
    };

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Modelo
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Cadastrar Modelo do Equipamento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} autoComplete="off"autoComplete="off">

                        <div className="md:col-span-2 grid gap-2">
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
                            {errors.brand_id && <div className="text-red-500 text-sm">{errors.brand_id}</div>}
                        </div>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="model">Nome do Modelo *</Label>
                                <Input
                                    id="model"
                                    value={data.model}
                                    onChange={(e) => setData("model", e.target.value)}
                                />
                                {errors.model && <div className="text-red-500 text-sm">{errors.model}</div>}
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
