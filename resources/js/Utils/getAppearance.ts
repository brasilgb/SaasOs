export const getAppearance = () => {
    if (typeof document === 'undefined') return 'light'; // Fallback para SSR
    const match = document.cookie.match(/appearance=([^;]+)/);
    return match ? match[1] : 'light';
};
