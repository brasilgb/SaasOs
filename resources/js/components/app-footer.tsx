import { maskCpfCnpj } from '@/Utils/mask';
import { usePage } from '@inertiajs/react';
import moment from 'moment';

type AppFooterPageProps = {
    company?: {
        companyname?: string | null;
        cnpj?: string | null;
    };
};

export default function AppFooter() {
    const { company } = usePage<AppFooterPageProps>().props;
    return (
        <footer className="border-sidebar-border/80 flex w-full items-center justify-between border-t px-3 shadow-md">
            <div className="mx-auto flex w-full flex-col items-center justify-between gap-1 p-2 px-4 sm:flex-row sm:gap-0">
                <span className="text-xs font-medium text-gray-600 text-center sm:text-left">
                    &copy;{moment().format('YYYY')} - {company?.companyname} - CNPJ: {maskCpfCnpj(company?.cnpj ?? '')}
                </span>
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                    <a href="https://sigmaos.com.br" target="_blank" rel="noreferrer">
                        SIGMAOS
                    </a>
                    <span className="text-gray-500">{import.meta.env.VITE_APP_VERSION}</span>
                </div>
            </div>
        </footer>
    );
}
