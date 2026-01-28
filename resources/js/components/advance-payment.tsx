import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangleIcon } from 'lucide-react';

interface Plan {
    id: number;
    name: string;
    value: number;
}

export function AdvancePayment() {
    const { props: pageProps } = usePage();
    const { plansData } = pageProps;
    const {
        qr_code,
        qr_code_base64,
        payment_id,
        error,
        message,
    } = (pageProps.flash || {}) as any;
    
    const [open, setOpen] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [view, setView] = useState<'plans' | 'payment'>('plans');

    const [qrCode, setQrCode] = useState<string | null>(null);
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
    const [paymentId, setPaymentId] = useState<string | number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Estado para a mensagem de erro

    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);

    // Efeito para sincronizar com as props do Inertia
    useEffect(() => {
        // Limpa erros antigos ao receber novas props ou reabrir
        if (open) {
            setErrorMessage(null);
        }

        if (qr_code && qr_code_base64 && payment_id) {
            setQrCode(qr_code);
            setQrCodeBase64(qr_code_base64);
            setPaymentId(payment_id);
            setView('payment');
            setOpen(true); // Abre o modal automaticamente
        } else if (error) {
            // Define a mensagem de erro e garante que o modal esteja aberto para exibi-la
            setErrorMessage(message || 'Ocorreu um erro inesperado ao processar o pagamento.');
            setView('plans');
            setOpen(true);
            setLoading(false);
        }
    }, [qr_code, qr_code_base64, payment_id, error, message]);

    // Reset state when modal is closed
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setView('plans');
                setPlans([]);
                setQrCode(null);
                setQrCodeBase64(null);
                setPaymentId(null);
                setCopied(false);
                setLoading(false);
                setErrorMessage(null); // Limpa a mensagem de erro ao fechar
            }, 300);
        } else {
            setLoading(true);
            setPlans(plansData as Plan[]);
            setLoading(false);
        }
    }, [open, plansData]);

    // Poll for payment status
    useEffect(() => {
        if (!paymentId) return;

        setChecking(true);
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(route('payment.status', paymentId));
                if (response.data.paid) {
                    clearInterval(interval);
                    setOpen(false);
                    router.visit('/'); // or show success message
                }
            } catch {}
        }, 5000);

        return () => {
            clearInterval(interval);
            setChecking(false);
        };
    }, [paymentId]);

    const handleSelectPlan = async (planId: number) => {
        setLoading(true);
        setErrorMessage(null); // Limpa erros antigos ao tentar novamente
        router.post(route('payment.select-plan'), {
            plan_id: planId,
            source: 'pay-in-advance',
        });
    };

    const handleCopyPix = () => {
        if (!qrCode) return;
        navigator.clipboard.writeText(qrCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const PlanSelectionView = () => (
        <div>
            <DialogHeader>
                <DialogTitle>Escolha um plano</DialogTitle>
                <DialogDescription>Escolha um plano para adiantar o pagamento.</DialogDescription>
            </DialogHeader>

            {/* Exibe a mensagem de erro, se houver */}
            {errorMessage && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Falha no Pagamento</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 gap-4 py-4">
                {plans.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">{plan.name}</h3>
                            <p className="text-2xl font-bold mt-2">
                                R$ {Number(plan.value).toFixed(2)}
                            </p>
                        </div>
                        <Button onClick={() => handleSelectPlan(plan.id)} className="mt-4 w-full" disabled={loading}>
                            {loading ? 'Processando...' : 'Selecionar plano'}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );

    const PaymentView = () => (
        <div>
            <DialogHeader>
                <DialogTitle>Realize o Pagamento</DialogTitle>
                <DialogDescription>Para continuar utilizando o sistema, realize o pagamento via Pix.</DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center">
                <div className="flex justify-center mb-4 border-2 border-dashed rounded p-2">
                    {qrCodeBase64 ? (
                        <img
                            src={`data:image/png;base64,${qrCodeBase64}`}
                            className="w-48 h-48 bg-white p-1 rounded"
                            alt="QR Code Pix"
                        />
                    ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-sm">
                            {loading ? 'Gerando QR Code...' : 'Erro ao gerar QR Code.'}
                        </div>
                    )}
                </div>
                <Button
                    onClick={handleCopyPix}
                    disabled={!qrCode || copied}
                    className={`w-full transition ${copied ? 'bg-green-600' : ''}`}
                >
                    {copied ? 'Código Pix copiado!' : 'Copiar código Pix'}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                    A liberação é automática após a confirmação do pagamento.
                </p>
                {checking && (
                    <p className="text-xs text-blue-600 mt-2">
                        Verificando pagamento automaticamente...
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Adiantar Pagamento</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                {view === 'plans' ? <PlanSelectionView /> : <PaymentView />}
            </DialogContent>
        </Dialog>
    );
}