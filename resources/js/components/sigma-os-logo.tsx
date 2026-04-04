import { getAppearance } from '@/Utils/getAppearance';
import { useEffect, useState } from 'react';

export function SigmaOSHorizontalLogo() {
    // Inicializa com o valor do cookie
    const [appearance, setAppearance] = useState(getAppearance());

    useEffect(() => {
        // 1. Criamos um observador para monitorar mudanças na tag <html>
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains('dark');
            setAppearance(isDark ? 'dark' : 'light');
        });

        // 2. Configuramos o que observar (atributos da classe)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        // 3. Limpeza ao desmontar o componente
        return () => observer.disconnect();
    }, []);

    // Definimos o path com base no estado reativo
    const logoSrc = appearance === 'light' ? '/logos/sigmaos-horizontal-light.png' : '/logos/sigmaos-horizontal-dark.png';

    return (
        <img
            src={logoSrc}
            alt="SigmaOS - Sistema de Ordens de Serviço"
            width={150}
            height={38}
            className="transition-all duration-300" // Opcional: suave transição
        />
    );
}

export function SigmaOSLoginLogo() {
    const [appearance, setAppearance] = useState(getAppearance());

    useEffect(() => {
        // 1. Criamos um observador para monitorar mudanças na tag <html>
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains('dark');
            setAppearance(isDark ? 'dark' : 'light');
        });

        // 2. Configuramos o que observar (atributos da classe)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        // 3. Limpeza ao desmontar o componente
        return () => observer.disconnect();
    }, []);

    // Definimos o path com base no estado reativo
    const logoSrc = appearance === 'light' ? '/logos/logo-light.png' : '/logos/logo-dark.png';

    return (
        <img
            src={logoSrc}
            alt="SigmaOS - Sistema de Ordens de Serviço"
            width={80}
            height={80}
            className="transition-all duration-300" // Opcional: suave transição
        />
    );
}

export function SigmaOSPanelLogo() {
    const [appearance, setAppearance] = useState(getAppearance());
    useEffect(() => {
        // 1. Criamos um observador para monitorar mudanças na tag <html>
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains('dark');
            setAppearance(isDark ? 'dark' : 'light');
        });

        // 2. Configuramos o que observar (atributos da classe)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        // 3. Limpeza ao desmontar o componente
        return () => observer.disconnect();
    }, []);

    // Definimos o path com base no estado reativo
    const logoSrc = appearance === 'light' ? '/logos/logo-light.png' : '/logos/logo-dark.png';
    return (
        <img
            src={logoSrc}
            alt="SigmaOS - Sistema de Ordens de Serviço"
            width={40} // Ajuste conforme o layout
            height={40}
        />
    );
}
