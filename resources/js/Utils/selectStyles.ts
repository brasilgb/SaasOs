import { type OptionType } from '@/types';
import { type StylesConfig } from 'react-select';

const selectStyles: StylesConfig<OptionType, false> = {
    control: (baseStyles) => ({
        ...baseStyles,
        fontSize: '14px',
        boxShadow: 'none',
        border: 'none',
        background: 'transparent',
        paddingBottom: '2px',
    }),
    singleValue: (base) => ({
        ...base,
        color: '#ebebeb', // cinza escuro (igual input padrão)
        fontSize: '14px',
    }),
    dropdownIndicator: (base) => ({
        ...base,
    }),
    menuList: (base) => ({
        ...base,
        fontSize: '14px',
    }),
};
export default selectStyles;
