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
import { MemoryStickIcon, Plus, Save, Trash2, WrenchIcon } from "lucide-react"
import { useForm } from "@inertiajs/react"
import Select from 'react-select';
import { maskMoney } from "@/Utils/mask"

export default function AddPartsModal({ onSubmit, parts }: any) {
    const [open, setOpen] = useState(false)

    const [addedParts, setAddedParts] = useState<any>([]);
    const [selectedPartId, setSelectedPartId] = useState<string>('');

    const optionsParts = parts.map((part: any) => ({
        value: part.id,
        label: part.name,
    }));

    const { data, setData, processing, post, errors, reset } = useForm({
        part_id: '',
        name: '',
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        onSubmit(addedParts);
        setOpen(false);
    }

    // Lógica para adicionar uma peça ao array
    const handlePartChange = (selected: any) => {

        const id = parseInt(selected?.value);
        setData('part_id', `${id}`);
        if (id) {
            // Verifica se a peça já foi adicionada
            const isAlreadyAdded = addedParts.some((part: any) => part.id === id);

            if (!isAlreadyAdded) {
                // Encontra os detalhes da peça a partir da lista de disponíveis
                const partToAdd = parts.find((part: any) => part.id === id);

                // Adiciona a peça ao array de forma imutável
                setAddedParts([...addedParts, { ...partToAdd, quantity: 1 }]);
            }

            // Reseta a seleção para a opção padrão
            setSelectedPartId('');
        }
    };

    // Lógica para remover uma peça do array
    const handleRemovePart = (partId: any) => {
        // Usa o método `filter` para criar um novo array sem a peça removida
        setAddedParts(addedParts.filter((part: any) => part.id !== partId));
    };

    // NOVO: Lógica para atualizar a quantidade do input
    const handleQuantityChange = (partId: string, newQuantity: string) => {
        // Encontra a peça pelo ID e atualiza sua quantidade
        setAddedParts(addedParts.map((part: any) => {
            if (part.id === partId) {
                // Garante que a quantidade seja um número positivo
                const quantity = Math.max(1, parseInt(newQuantity) || 1);
                return { ...part, quantity: quantity };
            }
            return part;
        }));
    };

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <MemoryStickIcon className="h-4 w-4" />
                        Inserir Peças
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Selecionar Peças</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="grid gap-4 py-4">

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="customer_id">Peças</Label>
                                <Select
                                    options={optionsParts}
                                    onChange={handlePartChange}
                                    placeholder="Selecione a peça"
                                    className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                            ...baseStyles,
                                            fontSize: '14px',
                                            boxShadow: 'none',
                                            border: 'none',
                                            background: 'transparent',
                                            paddingBottom: '2px',
                                        }),
                                        dropdownIndicator: (base) => ({
                                            ...base,

                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            fontSize: '14px',
                                        }),
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            {addedParts.map((part: any) => (
                                <div key={part.id} className="flex justify-between items-center gap-2 p-2 border rounded">
                                    <div className="text-sm w-38">{part.name}</div>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={part.quantity}
                                        onChange={(e) => handleQuantityChange(part.id, e.target.value)}
                                        className="w-20 mx-2 text-sm"
                                    />
                                    <div className="text-sm w-4">{part.sale_price}</div>
                                    <div className="text-sm w-4">{maskMoney((part.sale_price * part.quantity).toFixed(2))}</div>
                                    <Button variant={'destructive'} onClick={() => handleRemovePart(part.id)} className="btn btn-danger btn-sm">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <WrenchIcon className="h-4 w-4" />
                                Inserir na ordem
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
