function maskCep(value: string) {
    if (value) {
        value = value.replace(/\D/g, "");
        value = value.replace(/^(\d{5})(\d)/, "$1-$2");
        return value;
    }
}

function maskPhone(value: string) {
    if (value) {
        if (value.length < 11) {
            value = value.replace(/\D/g, "");
            value = value.replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
            return value;
        } else {
            value = value.replace(/\D/g, "");
            value = value.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
            return value;
        }
    }
}

function maskWhatsApp(value: string) {
    if (value) {
        value = value.replace(/\D/g, "");
        value = value.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})/, "$1$2$3$4");
        return value;
    }
}

function maskDate(value: string) {
    if (value) {
        value = value.replace(/\D/g, "");
        value = value.replace(/^(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
        return value;
    }
}

function maskCpfCnpj(value: string) {
    if (value) {
        if (value.length < 12) {
            value = value.replace(/\D/g, "");
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
            return value;
        } else {
            value = value.replace(/\D/g, "");
            value = value.replace(
                /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
                "$1.$2.$3/$4-$5",
            );
            return value;
        }
    }
}

function maskCnpj(value: string) {
    // Código secreto do Superuser (deve ser o mesmo usado no backend)
    const SUPERUSER_CNPJ_CODE = '0D82457BF990DE04D1F8F98AC7BFE7DC';

    // 1. VERIFICAÇÃO PRINCIPAL: Se for o hash do Superuser, retorna o valor sem formatar.
    if (value === SUPERUSER_CNPJ_CODE) {
        return value;
    }

    // 2. Lógica de formatação existente (para CNPJs normais)
    if (value && value.length < 21) {
        // Remove todos os caracteres não numéricos
        value = value.replace(/\D/g, "");

        // Aplica a máscara de CNPJ
        value = value.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
            "$1.$2.$3/$4-$5",
        );
        return value;
    }

    // Retorna o valor original se não atender às condições de formatação
    return value;
}

// function unMask(value: any) {
//     if (value) {
//         value = value.replace(/\D/g, "");
//         return value;
//     }
// }
// Sua função unMask deve garantir que o hash não seja alterado também
function unMask(value: any) {
    const SUPERUSER_CNPJ_CODE = '0D82457BF990DE04D1F8F98AC7BFE7DC';
    if (value === SUPERUSER_CNPJ_CODE) {
        return value;
    }
    return value.replace(/\D/g, "");
}

function maskMoney(value: any) {
    if (value) {
        var valorAlterado = value;
        valorAlterado = valorAlterado.replace(/\D/g, ""); // Remove todos os não dígitos
        valorAlterado = valorAlterado.replace(/(\d+)(\d{2})$/, "$1,$2"); // Adiciona a parte de centavos
        valorAlterado = valorAlterado.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); // Adiciona pontos a cada três dígitos
        valorAlterado = valorAlterado;
        return value = valorAlterado;
    }
}


function maskMoneyDot(value: string) {
    if (value) {
        var valorAlterado = value;
        valorAlterado = valorAlterado.replace(/\D/g, ""); // Remove todos os não dígitos
        valorAlterado = valorAlterado.replace(/(\d+)(\d{2})$/, "$1.$2"); // Adiciona a parte de centavos
        valorAlterado = valorAlterado;
        return value = valorAlterado;
    }
}

function createSlug(title: string) {
    if (title) {
        return title
            .toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/[^\w-]+/g, '') // Remove non-word characters (except hyphens)
            .replace(/--+/g, '-') // Replace multiple hyphens with a single hyphen
            .trim(); // Remove leading/trailing whitespace
    }
}

export { maskCep, maskPhone, maskDate, maskCpfCnpj, maskCnpj, unMask, maskMoney, maskMoneyDot, maskWhatsApp, createSlug };