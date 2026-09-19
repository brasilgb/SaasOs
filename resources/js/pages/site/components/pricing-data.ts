// Preço-base: mensalidade sem desconto. Os demais planos (e qualquer texto do
// site que cite "a partir de") são calculados a partir dele, então nunca ficam
// desatualizados em relação ao valor cobrado nos planos semestral e anual.
export const MONTHLY_BASE_PRICE = 89.9;

export const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const planDefinitions = [
    {
        name: 'Mensal',
        description: 'Plano com contratação mensal',
        whatsappMessage: 'Olá! Quero contratar o plano mensal do VetorOS.',
        months: 1,
        total: 89.9,
    },
    {
        name: 'Semestral',
        description: 'Plano com contratação semestral',
        whatsappMessage: 'Olá! Quero contratar o plano semestral do VetorOS.',
        months: 6,
        total: 479.4,
    },
    {
        name: 'Anual',
        description: 'Plano com contratação anual',
        whatsappMessage: 'Olá! Quero contratar o plano anual do VetorOS.',
        months: 12,
        total: 838.8,
        popular: true,
    },
];

const commonFeatures = [
    'Todos os recursos incluídos',
    'Usuários ilimitados',
    'Aplicativo Android',
    'Suporte prioritário',
    'Atualizações automáticas',
    'Backup diário',
];

export const plans = planDefinitions.map((plan) => {
    const monthlyEquivalent = plan.total / plan.months;
    const priceWithoutDiscount = MONTHLY_BASE_PRICE * plan.months;
    const savings = priceWithoutDiscount - plan.total;
    const discountPercent = savings > 0.009 ? Math.round((savings / priceWithoutDiscount) * 100) : 0;

    return {
        ...plan,
        price: formatCurrency(plan.total),
        monthlyEquivalent,
        priceNote: plan.months === 1 ? 'por mês' : `a cada ${plan.months} meses · equivale a ${formatCurrency(monthlyEquivalent)}/mês`,
        discountPercent,
        features: commonFeatures,
    };
});
