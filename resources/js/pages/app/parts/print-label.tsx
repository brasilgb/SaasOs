import Ean13Barcode, { isValidEan13 } from '@/components/ean13-barcode';
import { useEffect } from 'react';

type PartLabel = {
    category?: string;
    type?: string;
    name?: string;
    reference_number?: string | number;
    sale_price?: string | number;
};

// Larguras oficiais dos 107 simbolos do Code 128 (ISO/IEC 15417).
const CODE128_PATTERNS = [
    '212222',
    '222122',
    '222221',
    '121223',
    '121322',
    '131222',
    '122213',
    '122312',
    '132212',
    '221213',
    '221312',
    '231212',
    '112232',
    '122132',
    '122231',
    '113222',
    '123122',
    '123221',
    '223211',
    '221132',
    '221231',
    '213212',
    '223112',
    '312131',
    '311222',
    '321122',
    '321221',
    '312212',
    '322112',
    '322211',
    '212123',
    '212321',
    '232121',
    '111323',
    '131123',
    '131321',
    '112313',
    '132113',
    '132311',
    '211313',
    '231113',
    '231311',
    '112133',
    '112331',
    '132131',
    '113123',
    '113321',
    '133121',
    '313121',
    '211331',
    '231131',
    '213113',
    '213311',
    '213131',
    '311123',
    '311321',
    '331121',
    '312113',
    '312311',
    '332111',
    '314111',
    '221411',
    '431111',
    '111224',
    '111422',
    '121124',
    '121421',
    '141122',
    '141221',
    '112214',
    '112412',
    '122114',
    '122411',
    '142112',
    '142211',
    '241211',
    '221114',
    '413111',
    '241112',
    '134111',
    '111242',
    '121142',
    '121241',
    '114212',
    '124112',
    '124211',
    '411212',
    '421112',
    '421211',
    '212141',
    '214121',
    '412121',
    '111143',
    '111341',
    '131141',
    '114113',
    '114311',
    '411113',
    '411311',
    '113141',
    '114131',
    '311141',
    '411131',
    '211412',
    '211214',
    '211232',
    '2331112',
];

function normalizeBarcode(value: string) {
    return String(value || '')
        .trim()
        .replace(/[^\x20-\x7E]/g, '');
}

function Barcode({ value }: { value: string }) {
    if (!value) return null;
    if (isValidEan13(value)) return <Ean13Barcode className="part-barcode" value={value} />;

    const startCodeB = 104;
    const values = [...value].map((character) => character.charCodeAt(0) - 32);
    const checksum = (startCodeB + values.reduce((total, code, index) => total + code * (index + 1), 0)) % 103;
    const symbols = [startCodeB, ...values, checksum, 106];
    const quietZone = 10;
    const bars: { x: number; width: number }[] = [];
    let position = quietZone;

    symbols.forEach((symbol) => {
        CODE128_PATTERNS[symbol].split('').forEach((width, index) => {
            const moduleWidth = Number(width);

            if (index % 2 === 0) bars.push({ x: position, width: moduleWidth });
            position += moduleWidth;
        });
    });

    const totalWidth = position + quietZone;

    return (
        <svg className="part-barcode" viewBox={`0 0 ${totalWidth} 40`} preserveAspectRatio="none" aria-label={`Codigo de barras ${value}`}>
            {bars.map((bar, index) => (
                <rect key={`${bar.x}-${index}`} x={bar.x} y="0" width={bar.width} height="40" fill="#000" />
            ))}
        </svg>
    );
}

export default function PrintPartLabel({ part }: { part?: PartLabel }) {
    const barcode = normalizeBarcode(String(part?.reference_number ?? ''));

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
                    display: block;
                    color: #000;
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                    shape-rendering: crispEdges;
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
                    <div className="part-price">
                        R${' '}
                        {Number(part?.sale_price || 0)
                            .toFixed(2)
                            .replace('.', ',')}
                    </div>

                    <div className="part-footer">
                        <Barcode value={barcode} />
                        <div className="part-code">{barcode}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
