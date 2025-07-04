import { useEffect, useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { maskMoney, maskMoneyDot } from "@/Utils/mask"

export default function CreateBudget({ brands, models, services }: any) {
    const [open, setOpen] = useState(false)

    const { data, setData, processing, post, errors, reset } = useForm({
        brand_id: '',
        eqmodel_id: '',
        service_id: '',
        description: '',
        value: '',
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        post(route('register-budgets.store'), {
            onSuccess: () => {
                reset()
                setOpen(false)
            },
        });
    }

    const optionsBrands = brands.map((brand: any) => ({
        value: brand.id,
        label: brand.brand,
    }));

    const optionsModels = models.map((model: any) => ({
        value: model.id,
        label: model.model,
    }));

    const optionsServices = services.map((service: any) => ({
        value: service.id,
        label: service.service,
    }));

    useEffect(() => {
        setData((data: any) => ({ ...data, value: maskMoneyDot(data?.value) }));
    }, [data?.value]);

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Orçamento
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Cadastrar Orçamento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} autoComplete="off">

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="customer_id">Serviço *</Label>
                                <Select
                                    onValueChange={(value) => setData('service_id', value)}
                                    defaultValue={data.service_id}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione o serviço" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {optionsServices.map((opt: any) => (
                                                <SelectItem key={opt.value} value={`${opt.value}`}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.service_id && <div className="text-red-500 text-sm">{errors.service_id}</div>}
                            </div>
                        </div>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="customer_id">Marca</Label>
                                <Select
                                    onValueChange={(value) => setData('brand_id', value)}
                                    defaultValue={data.brand_id}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione a marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {optionsBrands.map((opt: any) => (
                                                <SelectItem key={opt.value} value={`${opt.value}`}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                </div>
                        </div>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="customer_id">Modelo</Label>
                                <Select
                                    onValueChange={(value) => setData('eqmodel_id', value)}
                                    defaultValue={data.eqmodel_id}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione o modelo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {optionsModels.map((opt: any) => (
                                                <SelectItem key={opt.value} value={`${opt.value}`}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                </div>
                        </div>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="description">Descrição *</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                />
                                {errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
                            </div>
                        </div>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="value">Valor *</Label>
                                <Input
                                    id="value"
                                    value={maskMoney(data.value)}
                                    onChange={(e) => setData("value", e.target.value)}
                                />
                                {errors.value && <div className="text-red-500 text-sm">{errors.value}</div>}
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
