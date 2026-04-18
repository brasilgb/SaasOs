import { useEffect } from 'react';

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

function normalizeBarcode(value: string) {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits) return digits.slice(0, 12);

    return `${Date.now()}`.slice(-12);
}

function Barcode({ value }: { value: string }) {
    const pattern = `1010${value
        .split('')
        .map((digit) => BAR_PATTERNS[digit] ?? BAR_PATTERNS['0'])
        .join('00')}101`;

    return (
        <div className="part-barcode" aria-label={`Codigo de barras ${value}`}>
            {pattern.split('').map((bit, index) => (
                <span key={`${value}-${index}`} className={bit === '1' ? 'bar on' : 'bar off'} />
            ))}
        </div>
    );
}

export default function PrintPartLabel({ part }: any) {
    const barcode = normalizeBarcode(part?.reference_number ?? '');

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            window.print();
        }, 300);

        return () => window.clearTimeout(timeout);
    }, []);

    return (
        <div className="bg-white text-black">
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
                .part-sheet {
                    width: 60mm;
                    height: 40mm;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3mm;
                    box-sizing: border-box;
                }
                .part-label {
                    width: 100%;
                    height: 100%;
                    border: 1.2px solid #000;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 2mm 2.2mm;
                    box-sizing: border-box;
                    gap: 1mm;
                    font-family: Arial, sans-serif;
                }
                .part-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2mm;
                    border-bottom: 1px solid #000;
                    padding-bottom: 1mm;
                }
                .part-badge {
                    font-size: 7px;
                    font-weight: 800;
                    letter-spacing: 0.8px;
                    border: 1px solid #000;
                    padding: 0.5mm 1.2mm;
                    white-space: nowrap;
                }
                .part-category {
                    font-size: 8px;
                    font-weight: 700;
                    max-width: 35mm;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .part-name {
                    font-size: 10px;
                    font-weight: 700;
                    line-height: 1.15;
                    min-height: 7mm;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .part-ref {
                    font-size: 8px;
                    line-height: 1;
                }
                .part-price {
                    font-size: 13px;
                    font-weight: 800;
                    line-height: 1;
                }
                .part-footer {
                    border-top: 1px solid #000;
                    padding-top: 1mm;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5mm;
                }
                .part-barcode {
                    width: 100%;
                    height: 8mm;
                    display: flex;
                    align-items: stretch;
                    justify-content: center;
                }
                .part-barcode .bar {
                    display: block;
                    width: 0.32mm;
                    height: 100%;
                }
                .part-barcode .bar.on {
                    background: #000;
                }
                .part-barcode .bar.off {
                    background: transparent;
                }
                .part-code {
                    font-size: 8px;
                    letter-spacing: 0.6px;
                    line-height: 1;
                    text-align: center;
                }
            `}</style>

            <div className="part-sheet">
                <div className="part-label">
                    <div className="part-top">
                        <div className="part-category">{part?.category || 'Produto'}</div>
                        <div className="part-badge">{part?.type === 'product' ? 'PRODUTO' : 'PECA'}</div>
                    </div>

                    <div className="part-name">{part?.name || 'Item sem nome'}</div>
                    <div className="part-ref">Ref: {part?.reference_number || '-'}</div>
                    <div className="part-price">R$ {Number(part?.sale_price || 0).toFixed(2).replace('.', ',')}</div>

                    <div className="part-footer">
                        <Barcode value={barcode} />
                        <div className="part-code">{barcode}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
