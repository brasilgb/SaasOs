import { type StylesConfig } from 'react-select';

const selectStyles: StylesConfig<any, false> = {
    control: (baseStyles, state) => ({
        ...baseStyles,
        minHeight: '36px',
        fontSize: '14px',
        borderRadius: '0.375rem',
        borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)',
        boxShadow: state.isFocused ? '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)' : 'none',
        background: 'var(--background)',
        ':hover': {
            borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)',
        },
    }),
    singleValue: (base) => ({
        ...base,
        color: 'var(--foreground)',
        fontSize: '14px',
    }),
    input: (base) => ({
        ...base,
        color: 'var(--foreground)',
    }),
    placeholder: (base) => ({
        ...base,
        color: 'var(--muted-foreground)',
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: 'var(--popover)',
        color: 'var(--popover-foreground)',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? 'var(--accent)'
            : state.isFocused
              ? 'color-mix(in oklab, var(--accent) 70%, var(--popover))'
              : 'var(--popover)',
        color: 'var(--foreground)',
    }),
    dropdownIndicator: (base) => ({
        ...base,
    }),
    indicatorSeparator: (base) => ({
        ...base,
        backgroundColor: 'var(--border)',
    }),
    menuList: (base) => ({
        ...base,
        fontSize: '14px',
        backgroundColor: 'var(--popover)',
    }),
};
export default selectStyles;
