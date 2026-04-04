import { usePage } from '@inertiajs/react';

type AdminLogoPageProps = {
    setting?: {
        logo?: string | null;
        shortname?: string | null;
    };
};

export default function AdminLogo() {
    const { setting } = usePage<AdminLogoPageProps>().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center">
                <img src={`${setting?.logo ? '/storage/logos/' + setting?.logo : '/images/default.png'}`} alt="Imagem de logo" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{setting?.shortname}</span>
            </div>
        </>
    );
}
