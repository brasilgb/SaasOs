const statusOrdemByValue = (value: any) => {
    switch (value) {
        case 1:
            return "Ordem Aberta";
        case 2:
            return "Ordem Fechada";
        case 3:
            return "Orçamento Gerado";
        case 4:
            return "Orçamento Aprovado";
        case 5:
            return "Reparo em andamento";
        case 6:
            return "Serviço concluído";
        case 7:
            return "Cliente avisado / aguardando retirada";
        case 8:
            return "Entregue ao cliente";
    }
};

const statusUserByValue = (value: any) => {
    switch (value) {
        case 'active':
            return "Ativo";
        case 'inactive':
            return "Inativo";
    }
};

const roleUserByValue = (value: any) => {
    switch (value) {
        case 9:
            return "RootApp";
        case 1:
            return "Administrador";
        case 2:
            return "Usuário";
        case 3:
            return "Técnico";
    }
};

const statusAgendaByValue = (value: any) => {
    switch (value) {
        case 1:
            return "Aberta";
        case 2:
            return "Atendimento";
        case 3:
            return "Fechada";
    }
};
const statusMessageByValue = (value: any) => {
    switch (value) {
        case 0:
            return "Não lida";
        case 1:
            return "lida";
    }
};

const statusSaasByValue = (value: any) => {
    switch (value) {
        case 0:
            return "Inativo";
        case 1:
            return "Ativo";
    }
};

const typesPartsByValue = (value: any) => {
    switch (value) {
        case 1:
            return 'Peças';
        case 2:
            return 'Produtos';
    }
}

export {
    statusOrdemByValue,
    statusUserByValue,
    roleUserByValue,
    statusAgendaByValue,
    statusMessageByValue,
    statusSaasByValue,
    typesPartsByValue
};
