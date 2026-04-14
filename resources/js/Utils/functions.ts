import { orderStatusLabel } from './order-status';

const statusOrdemByValue = (value: number) => orderStatusLabel(value);

const statusUserByValue = (value: string) => {
    switch (value) {
        case 'active':
            return 'Ativo';
        case 'inactive':
            return 'Inativo';
    }
};

const roleUserByValue = (value: number) => {
    switch (value) {
        case 9:
            return 'RootApp';
        case 1:
            return 'Administrador';
        case 2:
            return 'Operador/Atendente';
        case 3:
            return 'Técnico';
    }
};

const statusAgendaByValue = (value: number) => {
    switch (value) {
        case 1:
            return 'Aberta';
        case 2:
            return 'Atendimento';
        case 3:
            return 'Fechada';
    }
};
const statusMessageByValue = (value: number) => {
    switch (value) {
        case 0:
            return 'Não lida';
        case 1:
            return 'lida';
    }
};

const statusSaasByValue = (value: number) => {
    switch (value) {
        case 0:
            return 'Inativo';
        case 1:
            return 'Ativo';
    }
};

const typesPartsByValue = (value: number) => {
    switch (value) {
        case 1:
            return 'Peças';
        case 2:
            return 'Produtos';
        case 3:
            return 'Peças/Produtos';
    }
};

export { roleUserByValue, statusAgendaByValue, statusMessageByValue, statusOrdemByValue, statusSaasByValue, statusUserByValue, typesPartsByValue };
