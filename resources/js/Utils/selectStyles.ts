 const selectStyles = {
    control: (baseStyles: any, state: any) => ({
      ...baseStyles,
      fontSize: '14px',
      boxShadow: 'none',
      border: 'none',
      background: 'transparent',
      paddingBottom: '2px',
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