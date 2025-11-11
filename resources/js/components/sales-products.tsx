import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Select from 'react-select';
import { useForm } from '@inertiajs/react';
import { ShoppingCartIcon } from 'lucide-react';
import { maskMoney } from '@/Utils/mask';

interface Part {
    id: number;
    name: string;
    quantity: number;
    sale_price: any;
    customer_id: any;
}

interface SalesProductsProps {
    parts: Part[];
    customers: any[];
}

export function SalesProducts({ parts, customers}: SalesProductsProps) {
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [open, setOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { data, setData, post, processing, errors, reset } = useForm({
        part_id: '',
        customer_id: '',
        quantity: 1,
    });

    const optionsParts = parts.map((part: any) => ({
        value: part.id,
        label: part.name,
    }));
    const optionsCustomers = customers.map((customer: any) => ({
        value: customer.id,
        label: customer.name,
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.sales.store'), {
            onSuccess: () => {
                setSuccessMessage('Venda efetuada com sucesso!');
                reset();
                setSelectedPart(null);
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            },
        });
    };

    const changeParts = (selected: any) => {
        setData('part_id', selected?.value);
        const part = parts.find((part: any) => part.id === selected?.value);
        setSelectedPart(part || null);
    };

    const changeCustomers = (selected: any) => {
        setData('customer_id', selected?.value);
    };


    const handleClose = () => {
        setOpen(false);
        setSuccessMessage('');
        reset();
        setSelectedPart(null);
    };

    const selectedOptionParts = optionsParts.find(option => option.value === data.part_id) || null;
    const selectedOptionCustomers = optionsCustomers.find(option => option.value === data.customer_id) || null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
                handleClose();
            } else {
                setOpen(true);
            }
        }}>
            <DialogTrigger className='w-full h-full flex items-center justify-center cursor-pointer'>
                <ShoppingCartIcon size={50} className='text-green-300' />
            </DialogTrigger>
            <DialogContent className="sm:max-w-lvh">
                <DialogHeader>
                    <DialogTitle>Venda de Peças/Produtos</DialogTitle>
                    <DialogDescription>
                        Selecione a peça/produto e a quantidade para registrar a venda.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} autoComplete="off">
                    {successMessage && <p className="text-green-500 mb-4 text-center">{successMessage}</p>}
                    <div className="grid gap-4 py-4">
                        <div className="items-center gap-4">
                            <Label htmlFor="part_id" className="text-right mb-1">
                                Clientes
                            </Label>
                            <Select
                                isSearchable
                                value={selectedOptionCustomers}
                                options={optionsCustomers}
                                onChange={changeCustomers}
                                placeholder="Selecione o cliente"
                                className="w-full shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
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
                            {errors.customer_id && (
                                <p className="col-span-4 text-red-500 text-xs text-right">{errors.customer_id}</p>
                            )}
                        </div>
                        <div className="items-center gap-4">
                            <Label htmlFor="part_id" className="text-right mb-1">
                                Peças/produtos
                            </Label>
                            <Select
                                isSearchable
                                value={selectedOptionParts}
                                options={optionsParts}
                                onChange={changeParts}
                                placeholder="Selecione a peça/produto"
                                className="w-full shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
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
                            {errors.part_id && (
                                <p className="col-span-4 text-red-500 text-xs text-right">{errors.part_id}</p>
                            )}
                        </div>

                        <div className='flex items-center justify-start gap-4'>
                            <div className='text-sm'>Estoque: <span className='font-semibold text-blue-400'>{selectedPart?.quantity}</span></div>
                        </div>

                        <div className="items-center gap-4">
                            <Label htmlFor="quantity" className="text-right mb-1">
                                Quantidade
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={data.quantity}
                                onChange={e => setData('quantity', parseInt(e.target.value, 10) || 1)}
                                className="col-span-3"
                            />
                            {errors.quantity && (
                                <p className="col-span-4 text-red-500 text-xs text-right">{errors.quantity}</p>
                            )}
                        </div>
                    </div>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center justify-start gap-4'>
                            <div className='text-sm'>Valor unitário: <span className='font-semibold text-blue-400'>R$ {maskMoney(selectedPart?.sale_price)}</span></div>
                            <div className='text-sm'>Total: <span className='font-semibold text-blue-400'>R$ {maskMoney(String(data?.quantity * Number(selectedPart?.sale_price)))}</span></div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Fechar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Vendendo...' : 'Vender'}
                            </Button>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
export default SalesProducts;