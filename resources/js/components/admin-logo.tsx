import { usePage } from '@inertiajs/react';
import defaultImage from '@/images/default.png';

export default function AdminLogo() {
    const { setting } = usePage().props as any;
    
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center">
                <img
                    src={`${setting?.logo ? '/storage/logos/'+setting?.logo  : defaultImage }`}
                    alt="Imagem de logo"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{setting?.shortname}</span>
            </div>
        </>
    );
}
