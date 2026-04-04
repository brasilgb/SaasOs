function maskCep(value: string): string {
    if (value) {
        value = value.replace(/\D/g, '');
        value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        return value;
    }

    return '';
}

function maskPhone(value: string): string {
    if (value) {
        if (value.length < 11) {
            value = value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            return value;
        } else {
            value = value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            return value;
        }
    }

    return '';
}

function maskWhatsApp(value: string): string {
    if (value) {
        value = value.replace(/\D/g, '');
        value = value.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})/, '$1$2$3$4');
        return value;
    }

    return '';
}

function maskDate(value: string): string {
    if (value) {
        value = value.replace(/\D/g, '');
        value = value.replace(/^(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
        return value;
    }

    return '';
}

function maskCpfCnpj(value: string): string {
    if (value) {
        if (value.length < 12) {
            value = value.replace(/\D/g, '');
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            return value;
        } else {
            value = value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            return value;
        }
    }

    return '';
}

function maskCnpj(value: string): string {
    // Código secreto do Superuser (deve ser o mesmo usado no backend)
    const SUPERUSER_CNPJ_CODE = '0D82457BF990DE04D1F8F98AC7BFE7DC';

    // 1. VERIFICAÇÃO PRINCIPAL: Se for o hash do Superuser, retorna o valor sem formatar.
    if (value === SUPERUSER_CNPJ_CODE) {
        return value;
    }

    // 2. Lógica de formatação existente (para CNPJs normais)
    if (value && value.length < 21) {
        // Remove todos os caracteres não numéricos
        value = value.replace(/\D/g, '');

        // Aplica a máscara de CNPJ
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        return value;
    }

    // Retorna o valor original se não atender às condições de formatação
    return value;
}

function unMask(value: string): string {
    if (value) {
        value = value.replace(/\D/g, '');
        return value;
    }

    return '';
}
// Sua função unMask deve garantir que o hash não seja alterado também
function unMasCpfCnpj(value: string): string {
    const SUPERUSER_CNPJ_CODE = '0D82457BF990DE04D1F8F98AC7BFE7DC';
    if (value === SUPERUSER_CNPJ_CODE) {
        return value;
    }
    return value.replace(/\D/g, '');
}

function maskMoney(value: string): string {
    if (value) {
        let valorAlterado = value;
        valorAlterado = valorAlterado.replace(/\D/g, ''); // Remove todos os não dígitos
        valorAlterado = valorAlterado.replace(/(\d+)(\d{2})$/, '$1,$2'); // Adiciona a parte de centavos
        valorAlterado = valorAlterado.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'); // Adiciona pontos a cada três dígitos
        return valorAlterado;
    }

    return '';
}

function maskMoneyDot(value: string): string {
    if (value) {
        let valorAlterado = value;
        valorAlterado = valorAlterado.replace(/\D/g, ''); // Remove todos os não dígitos
        valorAlterado = valorAlterado.replace(/(\d+)(\d{2})$/, '$1.$2'); // Adiciona a parte de centavos
        return valorAlterado;
    }

    return '';
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
