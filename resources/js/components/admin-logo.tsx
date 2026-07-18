import { usePage } from '@inertiajs/react';

const DEFAULT_LOGO = '/images/default.png';

type AdminLogoPageProps = {
    setting?: {
        logo?: string | null;
        shortname?: string | null;
    };
};

export default function AdminLogo() {
    const { setting } = usePage<AdminLogoPageProps>().props;
    const logoSrc = setting?.logo ? `/storage/logos/${setting.logo}` : DEFAULT_LOGO;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center">
                <img
                    src={logoSrc}
                    alt="Imagem de logo"
                    onError={(event) => {
                        event.currentTarget.src = DEFAULT_LOGO;
                    }}
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{setting?.shortname}</span>
            </div>
        </>
    );
}
