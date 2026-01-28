import { useEffect, useState } from 'react';
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
    const { props } = usePage<any>();
    const plansData: Plan[] = props.plansData || [];

    const flash = props.flash || {};

    const [open, setOpen] = useState(false);
    const [view, setView] = useState<'plans' | 'payment'>('plans');

    const [plans, setPlans] = useState<Plan[]>([]);
    const [paymentId, setPaymentId] = useState<number | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);

    const [creatingPayment, setCreatingPayment] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [copied, setCopied] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    /* =========================
     ABERTURA / RESET
    ========================== */
    useEffect(() => {
        if (open) {
            setPlans(plansData);
            setErrorMessage(null);
        } else {
            setView('plans');
            setPaymentId(null);
            setQrCode(null);
            setQrCodeBase64(null);
            setCopied(false);
            setCreatingPayment(false);
            setCheckingPayment(false);
        }
    }, [open, plansData]);

    /* =========================
     RECEBE PIX DO BACKEND
    ========================== */
    useEffect(() => {
        if (flash.qr_code && flash.qr_code_base64 && flash.payment_id) {
            setQrCode(flash.qr_code);
            setQrCodeBase64(flash.qr_code_base64);
            setPaymentId(flash.payment_id);
            setView('payment');
            setOpen(true);
            setCreatingPayment(false);
        }

        if (flash.error) {
            setErrorMessage(
                flash.message || 'Erro ao gerar pagamento. Tente novamente.'
            );
            setCreatingPayment(false);
            setView('plans');
            setOpen(true);
        }
    }, [flash]);

    /* =========================
     POLLING DE PAGAMENTO
    ========================== */
    useEffect(() => {
        if (!paymentId || !open) return;

        setCheckingPayment(true);

        const interval = setInterval(async () => {
            try {
                const { data } = await axios.get(
                    route('payment.status', paymentId)
                );

                if (data.paid) {
                    clearInterval(interval);
                    setOpen(false);
                    router.visit('/');
                }
            } catch {}
        }, 5000);

        return () => {
            clearInterval(interval);
            setCheckingPayment(false);
        };
    }, [paymentId, open]);

    /* =========================
     ACTIONS
    ========================== */
    const handleSelectPlan = (planId: number) => {
        setCreatingPayment(true);
        setErrorMessage(null);

        router.post(route('payment.select-plan'), {
            plan_id: planId,
        });
    };

    const handleCopyPix = () => {
        if (!qrCode) return;
        navigator.clipboard.writeText(qrCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    /* =========================
     VIEWS
    ========================== */
    const PlanSelectionView = () => (
        <>
            <DialogHeader>
                <DialogTitle>Adiantar pagamento</DialogTitle>
                <DialogDescription>
                    Escolha um plano para renovar sua assinatura.
                </DialogDescription>
            </DialogHeader>

            {errorMessage && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 py-4">
                {plans.map(plan => (
                    <div
                        key={plan.id}
                        className="border rounded-lg p-4 flex flex-col justify-between"
                    >
                        <div>
                            <h3 className="font-semibold">{plan.name}</h3>
                            <p className="text-2xl font-bold mt-2">
                                R$ {Number(plan.value).toFixed(2)}
                            </p>
                        </div>

                        <Button
                            className="mt-4 w-full"
                            disabled={creatingPayment}
                            onClick={() => handleSelectPlan(plan.id)}
                        >
                            {creatingPayment
                                ? 'Gerando pagamento...'
                                : 'Selecionar plano'}
                        </Button>
                    </div>
                ))}
            </div>
        </>
    );

    const PaymentView = () => (
        <>
            <DialogHeader>
                <DialogTitle>Pagamento via Pix</DialogTitle>
                <DialogDescription>
                    Escaneie o QR Code ou copie o código Pix.
                </DialogDescription>
            </DialogHeader>

            <div className="py-4 text-center">
                <div className="flex justify-center mb-4 border-2 border-dashed rounded p-2">
                    {qrCodeBase64 ? (
                        <img
                            src={`data:image/png;base64,${qrCodeBase64}`}
                            className="w-48 h-48 bg-white rounded"
                        />
                    ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-sm">
                            Gerando QR Code...
                        </div>
                    )}
                </div>

                <Button
                    onClick={handleCopyPix}
                    disabled={!qrCode}
                    className={`w-full ${
                        copied ? 'bg-green-600 hover:bg-green-600' : ''
                    }`}
                >
                    {copied ? 'Pix copiado!' : 'Copiar código Pix'}
                </Button>

                {checkingPayment && (
                    <p className="text-xs text-blue-600 mt-3">
                        Verificando pagamento automaticamente...
                    </p>
                )}
            </div>
        </>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Adiantar pagamento</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                {view === 'plans' ? <PlanSelectionView /> : <PaymentView />}
            </DialogContent>
        </Dialog>
    );
}
