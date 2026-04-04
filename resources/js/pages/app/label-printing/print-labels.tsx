import { useEffect, useRef } from 'react';

const chunk = (array: any[], size: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
};

export default function Print({ data }: any) {
    const printRef = useRef<HTMLDivElement>(null);

    const pages = chunk(data || [], 96);

    useEffect(() => {
        setTimeout(() => {
            window.print();
        }, 300);
    }, []);

    return (
        <div ref={printRef}>
            {pages.map((page, pageIndex) => {
                const rows = chunk(page, 6);

                return (
                    <div key={pageIndex} className="page">
                        {rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="row">
                                {row.map((item, i) => (
                                    <div key={i} className="etiqueta">
                                        <div className="conteudo">
                                            <div className="empresa">{item.company}</div>
                                            <div className="pedido">{item.order}</div>
                                            <div className="telefone">{item.telephone}</div>
                                        </div>
                                    </div>
                                ))}

                                {/* preencher colunas */}
                                {row.length < 6 &&
                                    Array.from({ length: 6 - row.length }).map((_, i) => (
                                        <div key={i} className="etiqueta" />
                                    ))}
                            </div>
                        ))}

                        {/* preencher linhas */}
                        {rows.length < 16 &&
                            Array.from({ length: 16 - rows.length }).map((_, i) => (
                                <div key={i} className="row">
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <div key={j} className="etiqueta" />
                                    ))}
                                </div>
                            ))}
                    </div>
                );
            })}
        </div>
    );
}