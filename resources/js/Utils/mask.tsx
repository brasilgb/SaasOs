function onlyDigits(value: unknown): string {
    return String(value ?? '').replace(/\D/g, '');
}

function maskCep(value: string): string {
    const digits = onlyDigits(value).slice(0, 8);
    if (!digits) return '';
    if (digits.length <= 5) return digits;
    return digits.replace(/^(\d{5})(\d+)/, '$1-$2');
}

function maskPhone(value: string): string {
    const digits = onlyDigits(value).slice(0, 11);
    if (!digits) return '';

    if (digits.length <= 10) {
        return digits.replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_m, ddd, a, b) => {
            if (!ddd) return '';
            if (!a) return `(${ddd}`;
            if (!b) return `(${ddd}) ${a}`;
            return `(${ddd}) ${a}-${b}`;
        });
    }

    return digits.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
}

function maskWhatsApp(value: string): string {
    return onlyDigits(value).slice(0, 13);
}

function maskDate(value: string): string {
    const digits = onlyDigits(value).slice(0, 8);
    if (!digits) return '';
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.replace(/^(\d{2})(\d+)/, '$1/$2');
    return digits.replace(/^(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
}

function maskCpfCnpj(value: string): string {
    const digits = onlyDigits(value).slice(0, 14);
    if (!digits) return '';

    if (digits.length <= 11) {
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return digits.replace(/^(\d{3})(\d+)/, '$1.$2');
        if (digits.length <= 9) return digits.replace(/^(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
        return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    }

    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return digits.replace(/^(\d{2})(\d+)/, '$1.$2');
    if (digits.length <= 8) return digits.replace(/^(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    if (digits.length <= 12) return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
}

function maskCnpj(value: string): string {
    // Código secreto do Superuser (deve ser o mesmo usado no backend)
    const SUPERUSER_CNPJ_CODE = '0D82457BF990DE04D1F8F98AC7BFE7DC';

    // 1. VERIFICAÇÃO PRINCIPAL: Se for o hash do Superuser, retorna o valor sem formatar.
    if (value === SUPERUSER_CNPJ_CODE) {
        return value;
    }

    // 2. Lógica de formatação existente (para CNPJs normais)
    const digits = onlyDigits(value).slice(0, 14);
    if (!digits) return '';
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return digits.replace(/^(\d{2})(\d+)/, '$1.$2');
    if (digits.length <= 8) return digits.replace(/^(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    if (digits.length <= 12) return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
}

function unMask(value: string): string {
    return onlyDigits(value);
}
// Sua função unMask deve garantir que o hash não seja alterado também
function unMasCpfCnpj(value: unknown): string {
    const SUPERUSER_CNPJ_CODE = '0D82457BF990DE04D1F8F98AC7BFE7DC';
    if (String(value ?? '') === SUPERUSER_CNPJ_CODE) {
        return SUPERUSER_CNPJ_CODE;
    }
    return String(value ?? '').replace(/\D/g, '');
}

function parseMoneyInput(value: unknown): number {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    const raw = String(value ?? '').trim();
    if (!raw) return 0;

    const hasSeparator = raw.includes(',') || raw.includes('.');

    if (!hasSeparator) {
        const digits = onlyDigits(raw);
        if (!digits) return 0;
        return Number(digits) / 100;
    }

    const normalized = raw.includes(',')
        ? raw.replace(/\./g, '').replace(',', '.')
        : raw.replace(/,/g, '');

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
}

function maskMoney(value: unknown): string {
    if (value === null || value === undefined) return '';

    const raw = String(value).trim();
    if (!raw) return '';

    const amount = parseMoneyInput(value);

    return amount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function maskMoneyDot(value: string): string {
    const digits = onlyDigits(value).slice(0, 15);
    if (!digits) return '';
    const normalized = digits.length === 1 ? `0${digits}` : digits;
    const cents = normalized.slice(-2);
    const integerPart = normalized.slice(0, -2).replace(/^0+(?=\d)/, '') || '0';
    return `${integerPart}.${cents}`;
}

function createSlug(title: string): string {
    if (title) {
        return title
            .toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/[^\w-]+/g, '') // Remove non-word characters (except hyphens)
            .replace(/--+/g, '-') // Replace multiple hyphens with a single hyphen
            .trim(); // Remove leading/trailing whitespace
    }

    return '';
}

export { createSlug, maskCep, maskCnpj, maskCpfCnpj, maskDate, maskMoney, maskMoneyDot, maskPhone, maskWhatsApp, unMasCpfCnpj, unMask };
