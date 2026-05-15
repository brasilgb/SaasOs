import { type StylesConfig } from 'react-select';

const selectStyles: StylesConfig<any, false> = {
    control: (baseStyles, state) => ({
        ...baseStyles,
        minHeight: '36px',
        width: '100%',
        minWidth: 0,
        fontSize: '14px',
        borderRadius: '0.375rem',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)',
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        outline: 'none',
        boxShadow: state.isFocused ? '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)' : 'none',
        transition: 'color 150ms, border-color 150ms, box-shadow 150ms',
        ':hover': {
            borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)',
        },
    }),
    valueContainer: (base) => ({
        ...base,
        minWidth: 0,
        padding: '0 8px',
        backgroundColor: 'transparent',
    }),
    indicatorsContainer: (base) => ({
        ...base,
        backgroundColor: 'transparent',
    }),
    singleValue: (base) => ({
        ...base,
        color: 'var(--foreground)',
        fontSize: '14px',
    }),
    input: (base) => ({
        ...base,
        color: 'var(--foreground)',
        margin: 0,
        padding: 0,
        boxShadow: 'none',
        outline: 'none',
    }),
    placeholder: (base) => ({
        ...base,
        color: 'var(--muted-foreground)',
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: 'var(--popover)',
        color: 'var(--popover-foreground)',
        border: '1px solid var(--border)',
        borderRadius: '0.375rem',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        overflow: 'hidden',
        zIndex: 50,
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 50,
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? 'var(--accent)'
            : state.isFocused
              ? 'color-mix(in oklab, var(--accent) 70%, var(--popover))'
              : 'var(--popover)',
        color: 'var(--foreground)',
        cursor: 'pointer',
        ':active': {
            backgroundColor: 'var(--accent)',
        },
    }),
    dropdownIndicator: (base) => ({
        ...base,
        color: 'var(--muted-foreground)',
        ':hover': {
            color: 'var(--foreground)',
        },
    }),
    clearIndicator: (base) => ({
        ...base,
        color: 'var(--muted-foreground)',
        ':hover': {
            color: 'var(--foreground)',
        },
    }),
    indicatorSeparator: (base) => ({
        ...base,
        backgroundColor: 'var(--border)',
    }),
    menuList: (base) => ({
        ...base,
        fontSize: '14px',
        backgroundColor: 'var(--popover)',
        padding: '4px',
    }),
    group: (base) => ({
        ...base,
        backgroundColor: 'var(--popover)',
        paddingTop: 0,
        paddingBottom: 0,
    }),
    groupHeading: (base) => ({
        ...base,
        backgroundColor: 'var(--popover)',
        color: 'var(--muted-foreground)',
    }),
    noOptionsMessage: (base) => ({
        ...base,
        backgroundColor: 'var(--popover)',
        color: 'var(--muted-foreground)',
    }),
    loadingMessage: (base) => ({
        ...base,
        backgroundColor: 'var(--popover)',
        color: 'var(--muted-foreground)',
    }),
};
export default selectStyles;
