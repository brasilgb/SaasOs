const LEFT_PATTERNS = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const RIGHT_PATTERNS = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];
const PARITY_PATTERNS = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

export function ean13CheckDigit(payload: string) {
    const sum = [...payload].reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0);
    return String((10 - (sum % 10)) % 10);
}

export function generateEan13(value: string | number) {
    const digits = String(value).replace(/\D/g, '');
    const payload = digits.padStart(12, '0').slice(-12);
    return `${payload}${ean13CheckDigit(payload)}`;
}

export function isValidEan13(value: string) {
    return /^\d{13}$/.test(value) && ean13CheckDigit(value.slice(0, 12)) === value[12];
}

export function normalizeScannedEan13(value: string) {
    const digits = String(value).replace(/\D/g, '');
    if (!digits || digits.length > 13) return null;

    const ean = digits.padStart(13, '0');
    return isValidEan13(ean) ? ean : null;
}

export default function Ean13Barcode({ value, className = '' }: { value: string; className?: string }) {
    if (!isValidEan13(value)) return null;

    const digits = [...value].map(Number);
    const parity = PARITY_PATTERNS[digits[0]];
    const left = digits
        .slice(1, 7)
        .map((digit, index) => {
            const pattern = LEFT_PATTERNS[digit];
            return parity[index] === 'L'
                ? pattern
                : [...pattern]
                      .reverse()
                      .map((bit) => (bit === '1' ? '0' : '1'))
                      .join('');
        })
        .join('');
    const right = digits
        .slice(7)
        .map((digit) => RIGHT_PATTERNS[digit])
        .join('');
    const pattern = `101${left}01010${right}101`;
    const quietZone = 11;

    return (
        <svg className={className} viewBox={`0 0 ${pattern.length + quietZone * 2} 40`} preserveAspectRatio="none" aria-label={`EAN-13 ${value}`}>
            {[...pattern].map((bit, index) =>
                bit === '1' ? <rect key={index} x={index + quietZone} y="0" width="1" height="40" fill="#000" /> : null,
            )}
        </svg>
    );
}
