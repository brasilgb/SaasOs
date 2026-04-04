import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './ui/button';

type PaginationLink = {
    url: string | null;
    label: string;
    active?: boolean;
};

type PaginationData = {
    links: PaginationLink[];
    first_page_url: string | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    last_page_url: string | null;
    current_page: number;
    last_page: number;
};

type NavButtonProps = {
    url?: string | null;
    children: React.ReactNode;
    disabled?: boolean;
    variant?: 'outline' | 'secondary' | 'default';
    className?: string;
    srText?: string;
};

export default function AppPagination({ data }: { data?: PaginationData | null }) {
    if (!data || !data.links) return null;

    const pageLinks = data.links.filter((link) => !isNaN(Number(link.label)));

    const NavButton = ({ url, children, disabled, variant = 'outline', className = '', srText = '' }: NavButtonProps) => {
        const isButtonDisabled = !url || disabled;

        const content = (
            <>
                {srText && <span className="sr-only">{srText}</span>}
                {children}
            </>
        );

        if (isButtonDisabled) {
            return (
                <Button variant={variant} size="icon" className={`size-8 ${className}`} disabled>
                    {content}
                </Button>
            );
        }

        return (
            <Button variant={variant} size="icon" className={`size-8 ${className}`} asChild>
                <Link href={url}>{content}</Link>
            </Button>
        );
    };

    return (
        <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            {/* Navegação */}
            <div className="flex w-full items-center justify-start gap-2 overflow-x-auto">
                <NavButton url={data.first_page_url} disabled={data.current_page === 1} className="hidden md:flex" srText="Primeira página">
                    <ChevronsLeft className="size-4" />
                </NavButton>

                <NavButton url={data.prev_page_url} srText="Página anterior">
                    <ChevronLeft className="size-4" />
                </NavButton>

                {pageLinks.map((item, index: number) => (
                    <NavButton key={index} url={item.url} variant={item.active ? 'default' : 'secondary'} disabled={item.active}>
                        {item.label}
                    </NavButton>
                ))}

                <NavButton url={data.next_page_url} srText="Próxima página">
                    <ChevronRight className="size-4" />
                </NavButton>

                <NavButton url={data.last_page_url} disabled={data.current_page === data.last_page} className="hidden md:flex" srText="Última página">
                    <ChevronsRight className="size-4" />
                </NavButton>
            </div>

            {/* Contagem */}
            <div className="text-muted-foreground text-sm">
                Página <strong>{data.current_page}</strong> de <strong>{data.last_page}</strong>
            </div>
        </div>
    );
}
