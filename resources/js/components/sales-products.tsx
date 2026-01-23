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
import { useForm, usePage } from '@inertiajs/react';
import { Printer, FileText, Loader2, ShoppingCartIcon, Trash2 } from 'lucide-react'; // Adicionado Trash2 para remover item
import { maskMoney } from '@/Utils/mask';
import { pdf } from '@react-pdf/renderer';
import SaleReceiptPDF from './SaleReceiptPDF';
import { toastSuccess, toastWarning } from './app-toast-messages';
import { apios } from '@/Utils/connectApi';
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

interface CartItem extends Part {
    cartItemId: string;
    selected_quantity: number;
    stock_quantity: number; // Adicione isso para clareza
}

export function SalesProducts({ parts, customers }: SalesProductsProps) {
        const { auth } = usePage().props as any;
        const companyData = auth?.user?.tenant;
        
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [open, setOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [cartItems, setCartItems] = useState<CartItem[]>([]); // New state for cart items
    const [saleCompleted, setSaleCompleted] = useState(false);
    const [saleData, setSaleData] = useState<any>([]);

    const [isPrintingThermal, setIsPrintingThermal] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const receiptRef = useRef<HTMLDivElement>(null);

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
    if (selectedPart && data.quantity > 0) {
        // 1. Verifica se o item já está no carrinho
        const existingItemIndex = cartItems.findIndex(item => item.id === selectedPart.id);
        
        // 2. Calcula quanto já tem no carrinho desse item
        const quantityInCart = existingItemIndex > -1 ? cartItems[existingItemIndex].selected_quantity : 0;
        
        // 3. Validação REAL de estoque (Carrinho + O que está tentando adicionar agora)
        if ((quantityInCart + data.quantity) > selectedPart.quantity) {
            alert(`Estoque insuficiente. Você já tem ${quantityInCart} no carrinho e o estoque total é ${selectedPart.quantity}.`);
            return;
        }

        if (existingItemIndex > -1) {
            // ATUALIZAR ITEM EXISTENTE
            const updatedCart = cartItems.map((item, index) =>
                index === existingItemIndex
                    ? { ...item, selected_quantity: item.selected_quantity + data.quantity }
                    : item
            );
            setCartItems(updatedCart);
        } else {
            // ADICIONAR NOVO ITEM
            
            // AQUI ESTÁ O TRUQUE: 
            // Separamos a 'quantity' (que é estoque) do resto dos dados
            const { quantity: stockQuantity, ...partDetails } = selectedPart;

            const newItem: CartItem = {
                ...partDetails, // Copia id, name, price... (SEM o quantity do estoque)
                cartItemId: Date.now().toString(),
                selected_quantity: data.quantity, // Esta é a quantidade vendida

                // Opcional: Se sua interface TypeScript exigir 'quantity', 
                // você pode recolocar, mas sabendo que é o estoque.
                // O ideal é usar apenas 'selected_quantity' para venda.
                quantity: stockQuantity,
               stock_quantity: selectedPart.quantity
            };
            setCartItems(prevItems => [...prevItems, newItem]);
        }

        // Reset inputs
        setSelectedPart(null);
        setData(prevData => ({ ...prevData, part_id: '', quantity: 1 }));
        
    } else if (selectedPart && data.quantity > selectedPart.quantity) {
         alert('Quantidade maior que o estoque disponível.');
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
            setSaleData(response.data.sale);


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
        setSaleCompleted(false); // Reseta o estado da venda // Limpa o nome do cliente para a próxima venda
    };

    const handleNewSale = () => {
        setSuccessMessage('');
        reset();
        setSelectedPart(null);
        setCartItems([]);
        setSaleCompleted(false);
        setCustomerNameToPrint(undefined);
    };

    const selectedOptionParts = optionsParts.find(option => option.value === data.part_id) || null;
    const selectedOptionCustomers = optionsCustomers.find(option => option.value === data.customer_id) || null;

    const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.sale_price) * item.selected_quantity), 0);

    const paper = usePaperSize()

    // 1. Função para Cupom Não Fiscal (Térmica)
    const handlePrintThermal = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: "Comprovante de Pagamento",
        // Troque 'onBeforeGetContent' por 'onBeforePrint'
        onBeforePrint: async () => {
            setIsPrintingThermal(true);
            // Se precisar fazer alguma validação ou busca de dados antes de imprimir, faça aqui
            return Promise.resolve();
        },
        onAfterPrint: () => setIsPrintingThermal(false),
        onPrintError: () => setIsPrintingThermal(false),
    });

    // 2. Função para Recibo A4 (PDF)
    const handleGeneratePDF = async () => {
        if (cartItems.length === 0) return;

        setIsGeneratingPdf(true);
        try {
            const customerNameForPDF = selectedOptionCustomers?.label || 'Consumidor Final';

            // Gera o blob do PDF
            const blob = await pdf(
                <SaleReceiptPDF
                    items={cartItems}
                    total={cartTotal}
                    customerName={customerNameForPDF}
                    sale={saleData}
                    company={companyData}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            window.open(url, "_blank"); // Abre em nova aba para imprimir
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Erro ao gerar o PDF.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

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

                    <DialogFooter className="mt-4 sm:justify-between gap-2">
                        {/* Botão Fechar (sempre visível ou ajuste conforme preferência) */}
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Fechar
                        </Button>

                        {!saleCompleted ? (
                            <Button type="submit" disabled={processing || cartItems.length === 0} className="w-full sm:w-auto">
                                {processing ? <Loader2 className="animate-spin mr-2" /> : null}
                                {processing ? 'Processando...' : 'Finalizar Venda'}
                            </Button>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-end">
                                {/* Botão Nova Venda */}
                                <Button type="button" variant="secondary" onClick={handleNewSale}>
                                    Nova Venda
                                </Button>

                                {/* Botão 1: Cupom Não Fiscal (Térmica) */}
                                <Button
                                    type="button"
                                    onClick={() => handlePrintThermal()}
                                    disabled={isPrintingThermal || isGeneratingPdf}
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                    {isPrintingThermal ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Printer className="size-4" />
                                    )}
                                    Cupom
                                </Button>

                                {/* Botão 2: Recibo PDF */}
                                <Button
                                    type="button"
                                    onClick={handleGeneratePDF}
                                    disabled={isPrintingThermal || isGeneratingPdf}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {isGeneratingPdf ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <FileText className="size-4" />
                                    )}
                                    Recibo PDF
                                </Button>
                            </div>
                        )}
                    </DialogFooter>

                </form>

                <div className="hidden">
                    <Receipt
                        ref={receiptRef}
                        paper={paper}
                        items={cartItems}
                        total={cartTotal}
                        customer={selectedOptionCustomers?.label || "Consumidor Final"}
                        sale={saleData}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
