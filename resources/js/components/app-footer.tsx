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
            <div className="mx-auto flex w-full items-center justify-between p-2 px-4">
                <span className="text-xs font-medium text-gray-600">
                    &copy;{moment().format('YYYY')} - {company?.companyname} - CNPJ: {maskCpfCnpj(company?.cnpj ?? '')}
                </span>
                <a href="https://sigmaos.com.br" target="_blank" className="text-xs font-semibold text-gray-600">
                    SIGMAOS
                </a>
            </div>
        </footer>
    );
}
