const brandName = 'VetorOS';
const logoSrc = '/images/vetor.png';

function BrandMark({ compact = false }: { compact?: boolean }) {
    return (
        <img
            src={logoSrc}
            alt={`${brandName} - Sistema de Ordens de Serviço`}
            width={compact ? 36 : 40}
            height={compact ? 36 : 40}
            className={compact ? 'size-9 rounded-md object-contain' : 'size-10 object-contain'}
        />
    );
}

export function BrandHorizontalLogo({ inverse = false }: { inverse?: boolean }) {
    return (
        <span className="inline-flex items-center gap-2 text-current">
            <BrandMark />
            <span className="font-brand text-xl font-bold tracking-normal" aria-label={brandName}>
                <span className={inverse ? 'text-white' : 'text-slate-950'}>Vetor</span>
                <span className="text-[#00B4FF]">OS</span>
            </span>
        </span>
    );
}

export function BrandLoginLogo() {
    return <img src={logoSrc} alt={`${brandName} - Sistema de Ordens de Serviço`} width={80} height={80} className="size-20 object-contain" />;
}

export function BrandPanelLogo() {
    return <BrandMark compact />;
}
