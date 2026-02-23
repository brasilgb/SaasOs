import React from "react";

type WhatsAppButtonProps = {
    phone: string;
    customerName: string;
    orderNumber?: string;
    status?: string | number;
    feedback?: boolean;

    whats?: {
        generatedbudget?: string;
        servicecompleted?: string;
        feedback?: string;
    };

    className?: string;
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
};

const buildMessage = ({
    customerName,
    orderNumber,
    status,
    feedback,
    whats,
}: Omit<WhatsAppButtonProps, "phone" | "className">) => {
    const greeting = getGreeting();

    console.log('status', status);
    
    // prioridade: feedback > status
    if (feedback && whats?.feedback) {
        return `${greeting}, ${customerName}!\n\n${whats.feedback}`;
    }

    if (status == 3 && whats?.generatedbudget) {
        return `${greeting}, ${customerName}!\n\n${whats.generatedbudget}`;
    }

    if (status == 7 && whats?.servicecompleted) {
        return `${greeting}, ${customerName}!\n\n${whats.servicecompleted}`;
    }

    // fallback padrão
    return `${greeting}, ${customerName}! Como você está?\nOS #${orderNumber ?? "-"}`;
};

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
    phone,
    customerName,
    orderNumber,
    status,
    feedback,
    whats,
    className,
}) => {
    const handleClick = () => {
        if (!phone) return;

        // limpa número (remove tudo que não for número)
        let cleanPhone = phone.replace(/\D/g, "");

        // garante prefixo BR (55)
        if (!cleanPhone.startsWith("55")) {
            cleanPhone = `55${cleanPhone}`;
        }

        const message = buildMessage({
            customerName,
            orderNumber,
            status,
            feedback,
            whats,
        });

        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank");
    };

    return (
        <button
            onClick={handleClick}
            className={className || "px-3 py-2 bg-green-500 text-white rounded-md"}
        >
            WhatsApp
        </button>
    );
};
