import React, { useState, useEffect, Fragment, useRef } from 'react';
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
import { Loader2, ShoppingCartIcon, Trash2 } from 'lucide-react'; // Adicionado Trash2 para remover item
import { maskMoney } from '@/Utils/mask';
import { pdf } from '@react-pdf/renderer';
import SaleReceiptPDF from './SaleReceiptPDF';
import { toastSuccess, toastWarning } from './app-toast-messages';
import {apios} from '@/Utils/connectApi';
import Receipt from '@/pages/app/sales/receipt';
import { useReactToPrint } from "react-to-print"
import { usePaperSize } from '@/hooks/usePaperSize';

interface Part {
    id: number;
    name: string;
    quantity: number; // This is the stock quantity
    sale_price: number;
    customer_id: any;
}

interface CartItem extends Part {
    cartItemId: string; // Unique ID for item in cart
    selected_quantity: number;
}

interface SalesProductsProps {
    parts: Part[];
    customers: any[];
}

export function SalesProducts({ parts, customers }: SalesProductsProps) {
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [open, setOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [cartItems, setCartItems] = useState<CartItem[]>([]); // New state for cart items
    const [saleCompleted, setSaleCompleted] = useState(false);
    const [customerNameToPrint, setCustomerNameToPrint] = useState<string | undefined>(undefined);
    const [isPrinting, setIsPrinting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: '',
        part_id: '', // Keep part_id for selecting a part to add to cart
        quantity: 1, // Quantity for the currently selected part
        parts: [] as { part_id: number; quantity: number }[], // This will be populated from cartItems
        total_amount: 0,
    });

    const optionsParts = parts.map((part: any) => ({
        value: part.id,
        label: part.name,
    }));
    const optionsCustomers = customers.map((customer: any) => ({
        value: customer.id,
        label: customer.name,
    }));

    useEffect(() => {
        const total = cartItems.reduce((sum, item) => sum + (Number(item.sale_price) * item.selected_quantity), 0);
        setData(prevData => ({
            ...prevData,
            parts: cartItems.map(item => ({ part_id: item.id, quantity: item.selected_quantity })),
            total_amount: total,
        }));
    }, [cartItems]);

    const addToCart = () => {
        if (selectedPart && data.quantity > 0 && data.quantity <= selectedPart.quantity) {
            const existingItemIndex = cartItems.findIndex(item => item.id === selectedPart.id);

            if (existingItemIndex > -1) {
                // Update quantity if item already in cart
                const updatedCart = cartItems.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, selected_quantity: item.selected_quantity + data.quantity }
                        : item
                );
                setCartItems(updatedCart);
            } else {
                // Add new item to cart
                const newItem: CartItem = {
                    ...selectedPart,
                    cartItemId: Date.now().toString(), // Unique ID for cart item
                    selected_quantity: data.quantity,
                };
                setCartItems(prevItems => [...prevItems, newItem]);
            }
            // Reset selected part and quantity after adding to cart
            setSelectedPart(null);
            setData(prevData => ({ ...prevData, part_id: '', quantity: 1 }));
        } else if (data.quantity > Number(selectedPart?.quantity) || selectedPart === null) {
            alert('Quantidade em estoque insuficiente.');
        }
    };

    const removeFromCart = (cartItemId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
        setData(data => ({
            ...data,
            part_id: '',
            quantity: 1,
        }))
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            alert('Adicione itens ao carrinho antes de finalizar a venda.');
            return;
        }

        try { 
            const response = await apios.post(
                route('app.sales.store'),
                {
                    customer_id: data.customer_id,
                    parts: cartItems.map(item => ({
                        part_id: item.id,
                        quantity: item.selected_quantity,
                    })),
                    total_amount: cartTotal,
                }
            )

            toastSuccess('Sucesso', 'Venda realizada com sucesso')

            setSaleCompleted(true)
            setOpen(true)

        } catch (error: any) {
            toastWarning(error.response?.data?.message ?? 'Erro ao realizar venda')
        }

    };

    const changeParts = (selected: any) => {
        setData('part_id', selected?.value);
        const part = parts.find((part: any) => part.id === selected?.value);
        setSelectedPart(part || null);
        setData('quantity', 1); // Reset quantity when part changes
    };

    const changeCustomers = (selected: any) => {
        setData('customer_id', selected?.value);
    };

    const handleClose = () => {
        setOpen(false);
        setSuccessMessage('');
        reset();
        setSelectedPart(null);
        setCartItems([]); // Clear cart on dialog close
        setSaleCompleted(false); // Reseta o estado da venda
        setCustomerNameToPrint(undefined); // Limpa o nome do cliente para a próxima venda
    };

    const handleNewSale = () => {
        setSuccessMessage('');
        reset();
        setSelectedPart(null);
        setCartItems([]);
        setSaleCompleted(false);
        setCustomerNameToPrint(undefined);
    };

    const handlePrintReceipt = async () => {
        if (cartItems.length === 0) {
            alert("O carrinho está vazio. Adicione itens para gerar um recibo.");
            return;
        }
        setIsPrinting(true);
        try {
            const customerNameForPDF = customerNameToPrint || 'Consumidor Final';
            const blob = await pdf(
                <SaleReceiptPDF items={cartItems} total={cartTotal} customerName={customerNameForPDF} />
            ).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
        } catch (error) {
            console.error("Erro ao gerar o PDF:", error);
            alert("Ocorreu um erro ao gerar o recibo. Tente novamente.");
        } finally {
            setIsPrinting(false);
        }
    };

    const selectedOptionParts = optionsParts.find(option => option.value === data.part_id) || null;
    const selectedOptionCustomers = optionsCustomers.find(option => option.value === data.customer_id) || null;

    const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.sale_price) * item.selected_quantity), 0);

    const paper = usePaperSize()
    const receiptRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: "Comprovante de Pagamento",
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className='w-full h-full flex items-center justify-center cursor-pointer'>
                <ShoppingCartIcon size={50} className='text-green-300' />
            </DialogTrigger>
            <DialogContent className="sm:max-w-lvh">
                <DialogHeader>
                    <DialogTitle>Frente de Caixa</DialogTitle>
                    <DialogDescription>
                        Registre uma nova venda.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} autoComplete="off">
                    {successMessage && <p className="text-green-500 mb-4 text-center">{successMessage}</p>}
                    <div className="grid gap-4 py-4">
                        <div className="items-center gap-4">
                            <Label htmlFor="customer_id" className="text-right mb-1">
                                Selecione o cliente
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
                        <div className='grid grid-cols-5 md:gap-4'>
                            <div className="items-center gap-4 col-span-2">
                                <Label htmlFor="part_id" className="text-right mb-1">
                                    Selecione o Produto
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
                            <div className="items-center gap-4 col-span-2">
                                <div>
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
                                </div>
                                <div className='h-4'>
                                    {!selectedPart || data.quantity <= 0 || data.quantity > selectedPart.quantity && (
                                        <div className="col-span-4 text-red-500 text-xs text-left">Estoque insuficiente</div>
                                    )}
                                </div>
                            </div>
                            <div className='md:mt-4.5'>
                                <Button type="button" onClick={addToCart} disabled={!selectedPart || data.quantity <= 0 || data.quantity > selectedPart.quantity}>
                                    <ShoppingCartIcon /> Adicionar
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="items-center gap-4">
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center justify-start gap-4'>
                                {selectedPart &&
                                    <>
                                        <div className='text-sm'>Em estoque: <span className='font-semibold text-blue-400'>{selectedPart?.quantity}</span></div>
                                        <div className='text-sm'>Valor unitário: <span className='font-semibold text-blue-400'>R$ {maskMoney(String(selectedPart?.sale_price))}</span></div>
                                        <div className='text-sm'>Total: <span className='font-semibold text-blue-400'>R$ {maskMoney(String(data?.quantity <= selectedPart?.quantity
                                            ? data?.quantity * Number(selectedPart?.sale_price)
                                            : selectedPart?.quantity * Number(selectedPart?.sale_price)
                                        )
                                        )}</span></div>
                                    </>
                                }
                            </div>
                        </div>
                    </div>

                    {cartItems.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                            <h3 className="text-lg font-semibold mb-2">Itens no Carrinho</h3>
                            {errors.parts && (
                                <p className="col-span-4 text-red-500 text-xs text-right">{errors.parts}</p>
                            )}
                            {cartItems.map(item => (
                                <div key={item.cartItemId} className="flex justify-between items-center mb-2">
                                    <span>{item.name} (x{item.selected_quantity}) - R$ {maskMoney(String(Number(item.sale_price) * item.selected_quantity))}</span>
                                    <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.cartItemId)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                            <div className="flex justify-between items-center font-bold mt-4">
                                <span>Total do Carrinho:</span>
                                <span>R$ {maskMoney(String(cartTotal))}</span>
                            </div>
                            {errors.total_amount && (
                                <p className="col-span-4 text-red-500 text-xs text-right">{errors.total_amount}</p>
                            )}
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Fechar
                        </Button>
                        {!saleCompleted ? (
                            <Button type="submit" disabled={processing || cartItems.length === 0}>
                                {processing ? 'Vendendo...' : 'Finalizar Venda'}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handlePrint}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                    disabled={isPrinting}
                                >
                                    {isPrinting ? (
                                        <Fragment>
                                            <Loader2 className="mr-2 size-4 animate-spin" /> Imprimindo...
                                        </Fragment>
                                    ) : (
                                        'Imprimir Comprovante de Venda'
                                    )}
                                </Button>
                                <Button type="button" variant="default" onClick={handleNewSale}>
                                    Nova Venda
                                </Button>
                                <div className="hidden">
                                    <Receipt ref={receiptRef} paper={paper} items={cartItems} total={cartTotal} customer={customerNameToPrint} />
                                </div>
                            </>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
/*

const handlePrintReceipt = async () => {
        if (cartItems.length === 0) {
            alert("O carrinho está vazio. Adicione itens para gerar um recibo.");
            return;
        }
        setIsPrinting(true);
        try {
            const customerNameForPDF = customerNameToPrint || 'Consumidor Final';
            const blob = await pdf(
                <SaleReceiptPDF items={cartItems} total={cartTotal} customerName={customerNameForPDF} />
            ).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
        } catch (error) {
            console.error("Erro ao gerar o PDF:", error);
            alert("Ocorreu um erro ao gerar o recibo. Tente novamente.");
        } finally {
            setIsPrinting(false);
        }


            const optionsCustomers = customers.map((customer: any) => ({
        value: customer.id,
        label: customer.name,
    }));
    };
*/