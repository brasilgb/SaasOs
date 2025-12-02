import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { company } = usePage().props as any;
   
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center bg-white">
                <img
                    src={`/storage/logos/${company?.logo ? company?.logo : "default.png"}`}
                    alt="Imagem de logo"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{company?.shortname}</span>
            </div>
        </>
    );
}
