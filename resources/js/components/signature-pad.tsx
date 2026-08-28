import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SignaturePadProps {
    /** Assinatura atual em base64 (sem o prefixo data:image/png;base64,), ou vazio se não capturada. */
    value: string;
    onChange: (base64: string) => void;
    className?: string;
}

/**
 * Campo de assinatura por toque/mouse. Não depende de nenhuma lib externa: desenha num
 * <canvas> com pointer events e exporta a assinatura como PNG em base64 (sem o prefixo
 * data:...;base64,) pra bater com o mesmo formato que o upload de imagens de OS já usa.
 */
export default function SignaturePad({ value, onChange, className }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawingRef = useRef(false);
    const hasStrokeRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    const fillWhiteBackground = (canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ratio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(ratio, ratio);

        fillWhiteBackground(canvas);

        if (!value) {
            hasStrokeRef.current = false;
            setIsEmpty(true);
        }
        // Só recalcula o tamanho ao montar; redesenhar a assinatura existente ao redimensionar
        // não é necessário aqui, pois o campo é sempre reiniciado junto com o formulário.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pointFromEvent = (canvas: HTMLCanvasElement, event: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.setPointerCapture(event.pointerId);
        drawingRef.current = true;
        lastPointRef.current = pointFromEvent(canvas, event);
    };

    const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const point = pointFromEvent(canvas, event);
        const last = lastPointRef.current ?? point;

        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();

        lastPointRef.current = point;
        hasStrokeRef.current = true;
        setIsEmpty(false);
    };

    const stopDrawing = () => {
        if (!drawingRef.current) return;
        drawingRef.current = false;
        lastPointRef.current = null;

        const canvas = canvasRef.current;
        if (!canvas || !hasStrokeRef.current) return;

        const dataUrl = canvas.toDataURL('image/png');
        onChange(dataUrl.replace(/^data:image\/png;base64,/, ''));
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        fillWhiteBackground(canvas);
        hasStrokeRef.current = false;
        setIsEmpty(true);
        onChange('');
    };

    return (
        <div className={className}>
            <div className="rounded-md border border-dashed">
                <canvas
                    ref={canvasRef}
                    className="h-40 w-full touch-none rounded-md"
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                    onPointerCancel={stopDrawing}
                />
            </div>
            <div className="mt-2 flex items-center justify-between">
                <p className="text-muted-foreground text-xs">{isEmpty ? 'Assine com o dedo ou o mouse na área acima.' : 'Assinatura capturada.'}</p>
                <Button type="button" size="sm" variant="outline" onClick={handleClear} disabled={isEmpty}>
                    <Eraser className="h-4 w-4" />
                    Limpar
                </Button>
            </div>
        </div>
    );
}
