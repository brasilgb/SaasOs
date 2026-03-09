const selectStyles = {
  control: (baseStyles: any, state: any) => ({
    ...baseStyles,
    fontSize: '14px',
    boxShadow: 'none',
    border: 'none',
    background: 'transparent',
    paddingBottom: '2px',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#ebebeb", // cinza escuro (igual input padrão)
    fontSize: "14px",
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
  }),
  menuList: (base: any) => ({
    ...base,
    fontSize: '14px',
  }),
};
export default selectStyles;