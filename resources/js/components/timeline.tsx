import { ORDER_STATUS } from '@/Utils/order-status';

const FLOW = [
    { value: ORDER_STATUS.OPEN, label: 'Ordem aberta' },
    { value: ORDER_STATUS.BUDGET_GENERATED, label: 'Orçamento gerado' },
    { value: ORDER_STATUS.BUDGET_APPROVED, label: 'Orçamento aprovado' },
    { value: ORDER_STATUS.REPAIR_IN_PROGRESS, label: 'Reparo em andamento' },
    { value: ORDER_STATUS.SERVICE_COMPLETED, label: 'Serviço concluído' },
    { value: ORDER_STATUS.CUSTOMER_NOTIFIED, label: 'Cliente avisado' },
    { value: ORDER_STATUS.DELIVERED, label: 'Entregue ao cliente' },
];

const BRANCH_CONFIG = {
    [ORDER_STATUS.BUDGET_REJECTED]: {
        label: 'Orçamento reprovado',
        color: 'red',
        stopAt: ORDER_STATUS.BUDGET_GENERATED,
    },
};

const COLORS = {
    red: {
        bg: 'bg-red-500',
        text: 'text-red-400',
        line: 'bg-red-500',
    },
};

type TimelineProps = {
    status: number;
};

export default function Timeline({ status }: TimelineProps) {
    const isBranch = status in BRANCH_CONFIG;
    const branch = BRANCH_CONFIG[status as keyof typeof BRANCH_CONFIG];

    const getProgressIndex = () => {
        if (isBranch) {
            return FLOW.findIndex((s) => s.value === branch.stopAt);
        }

        const index = FLOW.findIndex((s) => status < s.value);
        return index === -1 ? FLOW.length - 1 : index - 1;
    };

    const progressIndex = getProgressIndex();

    const progressPercent = (progressIndex / (FLOW.length - 1)) * 100;

    const isStepActive = (stepValue: number) => {
        if (isBranch) return stepValue <= branch.stopAt;
        return status >= stepValue;
    };

    return (
        <div className="mb-14">
            {/* STATUS */}
            <div className="mb-6 text-center">
                {isBranch ? (
                    <span className="rounded-full bg-red-500 px-4 py-1 text-xs text-white">{branch.label}</span>
                ) : (
                    <span className="rounded-full bg-green-600 px-4 py-1 text-xs text-white">Em andamento</span>
                )}
            </div>

            <div className="mb-14 overflow-x-auto py-4">
                <div className="relative flex min-w-[600px] items-center justify-between md:min-w-full">
                    <div className="absolute top-3 left-0 h-1 w-full rounded bg-gray-700 md:top-4" />

                    <div
                        className="absolute top-3 left-0 h-1 rounded bg-green-500 transition-all duration-500 md:top-4"
                        style={{ width: `${progressPercent}%` }}
                    />

                    {/* STEPS */}
                    {FLOW.map((step, index) => {
                        const active = isStepActive(step.value);

                        return (
                            <div key={step.value} className="relative z-10 flex flex-1 flex-col items-center">
                                {/* CÍRCULO */}
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                                        active ? 'border-green-500 bg-green-500 text-white' : 'border-gray-600 bg-gray-800 text-gray-300'
                                    }`}
                                >
                                    {active ? '✓' : index + 1}
                                </div>

                                {/* LABEL */}
                                <span className="mt-2 w-24 text-center text-xs text-gray-300">{step.label}</span>

                                {/* BRANCH */}
                                {isBranch && step.value === branch.stopAt && <BranchIndicator color="red" />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/**
 * Branch sem framer-motion (CSS puro)
 */
function BranchIndicator({ color }: { color: 'red' }) {
    const styles = COLORS[color];

    return (
        <div className="absolute top-10 flex flex-col items-center">
            {/* vertical */}
            <div className={`h-0 w-0.5 ${styles.line} animate-growY`} />

            {/* horizontal */}
            <div className={`h-0.5 w-0 ${styles.line} animate-growX`} />

            {/* nó */}
            <div
                className={`mt-2 h-8 w-8 rounded-full ${styles.bg} animate-pop flex scale-0 items-center justify-center text-xs font-bold text-white`}
            >
                ✕
            </div>

            <span className={`text-xs ${styles.text} mt-1`}>Reprovado</span>
        </div>
    );
}
