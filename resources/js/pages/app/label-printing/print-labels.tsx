import { useEffect, useRef } from 'react';

const chunk = (array: any[], size: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
};

const BAR_PATTERNS: Record<string, string> = {
    '0': '101001101101',
    '1': '110100101011',
    '2': '101100101011',
    '3': '110110010101',
    '4': '101001101011',
    '5': '110100110101',
    '6': '101100110101',
    '7': '101001011011',
    '8': '110100101101',
    '9': '101100101101',
};

function Barcode({ value }: { value: string }) {
    const pattern = `1010${value
        .split('')
        .map((digit) => BAR_PATTERNS[digit] ?? BAR_PATTERNS['0'])
        .join('00')}101`;

    return (
        <div className="thermal-barcode" aria-label={`Codigo de barras ${value}`}>
            {pattern.split('').map((bit, index) => (
                <span key={`${value}-${index}`} className={bit === '1' ? 'bar on' : 'bar off'} />
            ))}
        </div>
    );
}

export default function Print({ data, format = 'a4' }: any) {
    const printRef = useRef<HTMLDivElement>(null);
    const labels = Array.isArray(data) ? data : [];
    const pages = chunk(labels, 96);
    const isThermal = format === 'thermal';

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            window.print();
        }, 300);

        return () => window.clearTimeout(timeout);
    }, []);

    return (
        <div ref={printRef} className="bg-white text-black">
            {isThermal ? (
                <>
                    <style>{`
                        @page {
                            size: 60mm 40mm;
                            margin: 0;
                        }
                        @media print {
                            html, body {
                                margin: 0;
                                padding: 0;
                                width: 60mm;
                            }
                        }
                        .thermal-sheet {
                            display: flex;
                            flex-direction: column;
                            gap: 0;
                        }
                        .thermal-label {
                            width: 60mm;
                            height: 40mm;
                            box-sizing: border-box;
                            page-break-after: always;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 3mm;
                        }
                        .thermal-label:last-child {
                            page-break-after: auto;
                        }
                        .thermal-box {
                            width: 100%;
                            height: 100%;
                            border: 1.2px solid #000;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                            align-items: stretch;
                            text-align: center;
                            padding: 2mm 2.2mm;
                            box-sizing: border-box;
                            gap: 1mm;
                        }
                        .thermal-header {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            gap: 2mm;
                            border-bottom: 1px solid #000;
                            padding-bottom: 1mm;
                        }
                        .thermal-badge {
                            font-size: 7px;
                            font-weight: 800;
                            letter-spacing: 0.8px;
                            border: 1px solid #000;
                            padding: 0.5mm 1.2mm;
                            white-space: nowrap;
                        }
                        .thermal-company {
                            font-size: 9px;
                            font-weight: 700;
                            line-height: 1.1;
                            text-align: left;
                            max-width: 36mm;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        .thermal-body {
                            display: flex;
                            flex-direction: column;
                            align-items: stretch;
                            justify-content: center;
                            gap: 0.8mm;
                            flex: 1;
                        }
                        .thermal-customer {
                            font-size: 8.5px;
                            line-height: 1.1;
                            text-align: left;
                            max-width: 100%;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        .thermal-order-row {
                            display: flex;
                            align-items: baseline;
                            justify-content: flex-start;
                            gap: 1.6mm;
                        }
                        .thermal-order-tag {
                            font-size: 9px;
                            font-weight: 800;
                            letter-spacing: 0.8px;
                            line-height: 1;
                        }
                        .thermal-order-number {
                            font-size: 22px;
                            font-weight: 800;
                            line-height: 1;
                            letter-spacing: 0.5px;
                        }
                        .thermal-footer {
                            border-top: 1px solid #000;
                            padding-top: 1mm;
                            display: flex;
                            flex-direction: column;
                            gap: 0.5mm;
                        }
                        .thermal-phone {
                            font-size: 8.5px;
                            line-height: 1;
                            text-align: center;
                            max-width: 100%;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        .thermal-barcode {
                            width: 100%;
                            height: 8mm;
                            display: flex;
                            align-items: stretch;
                            justify-content: center;
                            gap: 0;
                        }
                        .thermal-barcode .bar {
                            display: block;
                            height: 100%;
                            width: 0.32mm;
                        }
                        .thermal-barcode .bar.on {
                            background: #000;
                        }
                        .thermal-barcode .bar.off {
                            background: transparent;
                        }
                        .thermal-code {
                            font-size: 8px;
                            letter-spacing: 0.6px;
                            line-height: 1;
                        }
                    `}</style>
                    <div className="thermal-sheet">
                        {labels.map((item, index) => (
                            <div key={`thermal-${index}-${item.order}`} className="thermal-label">
                                <div className="thermal-box">
                                    <div className="thermal-header">
                                        <div className="thermal-company">{item.company}</div>
                                        <div className="thermal-badge">ASSISTENCIA</div>
                                    </div>

                                    <div className="thermal-body">
                                        <div className="thermal-customer">{item.customer || 'Cliente nao informado'}</div>
                                        <div className="thermal-order-row">
                                            <div className="thermal-order-tag">OS</div>
                                            <div className="thermal-order-number">#{item.order}</div>
                                        </div>
                                    </div>

                                    <div className="thermal-footer">
                                        <Barcode value={item.barcode || String(item.order)} />
                                        <div className="thermal-code">{item.barcode || String(item.order)}</div>
                                        <div className="thermal-phone">{item.telephone}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                pages.map((page, pageIndex) => {
                    const rows = chunk(page, 6);

                    return (
                        <div key={pageIndex} className="page">
                            {rows.map((row, rowIndex) => (
                                <div key={rowIndex} className="row">
                                    {row.map((item, i) => (
                                        <div key={`${pageIndex}-${rowIndex}-${i}`} className="etiqueta">
                                            <div className="conteudo">
                                                <div className="empresa">{item.company}</div>
                                                <div className="pedido">{item.order}</div>
                                                <div className="telefone">{item.telephone}</div>
                                            </div>
                                        </div>
                                    ))}

                                    {row.length < 6 &&
                                        Array.from({ length: 6 - row.length }).map((_, i) => (
                                            <div key={`empty-col-${pageIndex}-${rowIndex}-${i}`} className="etiqueta" />
                                        ))}
                                </div>
                            ))}

                            {rows.length < 16 &&
                                Array.from({ length: 16 - rows.length }).map((_, i) => (
                                    <div key={`empty-row-${pageIndex}-${i}`} className="row">
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <div key={`empty-label-${pageIndex}-${i}-${j}`} className="etiqueta" />
                                        ))}
                                    </div>
                                ))}
                        </div>
                    );
                })
            )}
        </div>
    );
}
