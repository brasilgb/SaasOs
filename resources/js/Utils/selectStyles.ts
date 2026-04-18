import { type OptionType } from '@/types';
import { type StylesConfig } from 'react-select';

const selectStyles: StylesConfig<OptionType, false> = {
    control: (baseStyles) => ({
        ...baseStyles,
        fontSize: '14px',
        boxShadow: 'none',
        border: 'none',
        background: 'hsl(var(--background))',
        paddingBottom: '2px',
    }),
    singleValue: (base) => ({
        ...base,
        color: 'hsl(var(--foreground))',
        fontSize: '14px',
    }),
    input: (base) => ({
        ...base,
        color: 'hsl(var(--foreground))',
    }),
    placeholder: (base) => ({
        ...base,
        color: 'hsl(var(--muted-foreground))',
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: 'hsl(var(--popover))',
        color: 'hsl(var(--popover-foreground))',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? 'hsl(var(--accent))'
            : state.isFocused
              ? 'hsl(var(--accent) / 0.7)'
              : 'transparent',
        color: 'hsl(var(--foreground))',
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
