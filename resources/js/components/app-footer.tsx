import { maskCpfCnpj } from '@/Utils/mask';
import { usePage } from '@inertiajs/react';
import moment from 'moment';

export default function AppFooter() {
    const { company } = usePage().props as any;
    return (
        <footer className='w-full px-3 shadow-md border-sidebar-border/80 border-t flex items-center justify-between'>
            <div className='mx-auto h-8 flex items-center justify-between px-4 md:container w-full'>
                <span className='text-xs text-gray-600 font-medium'>&copy;{moment().format('YYYY')} - {company?.companyname} - CNPJ: {maskCpfCnpj(company?.cnpj)}</span>
                <a href="https://megb.com.br" target="_blank" className='text-xs font-semibold text-gray-600'>MEGB</a>
            </div>
        </footer>
    )
}
