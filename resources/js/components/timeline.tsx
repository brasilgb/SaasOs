export default function Timeline({ status }: { status: number }) {

    const steps = [
        { value: 1, label: "Ordem aberta" },
        { value: 3, label: "Orçamento gerado" },
        { value: 4, label: "Orçamento aprovado" },
        { value: 5, label: "Reparo em andamento" },
        { value: 6, label: "Serviço concluído" },
        { value: 8, label: "Entregue ao cliente" },
    ];

    const activeIndex = steps.findIndex(s => status < s.value);
    const progressIndex = activeIndex === -1 ? steps.length - 1 : activeIndex - 1;

    const progressPercent = (progressIndex / (steps.length - 1)) * 100;

    return (
        <div className="mb-10">

            <h2 className="text-sm font-semibold text-gray-300 text-center mb-6">
                Acompanhamento do Serviço
            </h2>

            <div className="relative flex items-center justify-between">

                {/* linha base */}
                <div className="absolute top-4 left-0 w-full h-1 bg-gray-700 rounded"></div>

                {/* progresso */}
                <div
                    className="absolute top-4 left-0 h-1 bg-green-500 rounded transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                />

                {steps.map((step, index) => {

                    const active = status >= step.value;

                    return (
                        <div
                            key={step.value}
                            className="flex flex-col items-center flex-1 relative z-10"
                        >

                            {/* círculo */}
                            <div
                                className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold border
                                ${active
                                        ? "bg-green-500 border-green-500 text-white"
                                        : "bg-gray-800 border-gray-600 text-gray-300"
                                    }`}
                            >
                                {active ? "✓" : index + 1}
                            </div>

                            {/* label */}
                            <span className="text-xs text-center mt-2 text-gray-300 w-24">
                                {step.label}
                            </span>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}
