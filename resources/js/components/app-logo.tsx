import { usePage } from '@inertiajs/react';

type AppLogoPageProps = {
    company?: {
        logo?: string | null;
        shortname?: string | null;
    };
};
 
export default function AppLogo() {
    const { company } = usePage<AppLogoPageProps>().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center">
                <img src={`${company?.logo ? `/storage/logos/${company?.logo}` : '/images/default.png'}`} alt="Imagem de logo" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{company?.shortname && company?.shortname}</span>
            </div>
        </>
    );
}
