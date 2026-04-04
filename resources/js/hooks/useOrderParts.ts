import { useEffect, useMemo, useState } from 'react';

type OrderPartInput = {
    id: number;
    name: string;
    sale_price: number | string;
    quantity?: number | string;
    pivot?: {
        quantity?: number | string;
    };
};

type OrderPart = {
    id: number;
    name: string;
    sale_price: number;
    quantity: number;
};

export function useOrderParts(initialParts: OrderPartInput[] = []) {
    const [allParts, setAllParts] = useState<OrderPart[]>([]);

    useEffect(() => {
        const formatted = (initialParts || []).map((p) => ({
            id: p.id,
            name: p.name,
            sale_price: Number(p.sale_price),
            quantity: Number(p.pivot?.quantity ?? p.quantity ?? 1),
        }));

        setAllParts(formatted);
    }, [initialParts]);

    const addParts = (parts: OrderPartInput[]) => {
        setAllParts((prev) => {
            const map = new Map(prev.map((p) => [p.id, p]));

            parts.forEach((p) => {
                map.set(p.id, {
                    id: p.id,
                    name: p.name,
                    sale_price: Number(p.sale_price),
                    quantity: Number(p.quantity),
                });
            });

            return Array.from(map.values());
        });
    };

    const removePart = (id: number) => {
        setAllParts((prev) => prev.filter((p) => p.id !== id));
    };

    // 🔥 MEMO AQUI
    const partsTotal = useMemo(() => {
        return allParts.reduce((acc, p) => acc + p.sale_price * p.quantity, 0);
    }, [allParts]);

    // 🔥 MEMO AQUI
    const payload = useMemo(() => {
        return allParts.map((p) => ({
            part_id: p.id,
            quantity: p.quantity,
        }));
    }, [allParts]);

    return {
        allParts,
        partsTotal,
        payload,
        addParts,
        removePart,
    };
}
