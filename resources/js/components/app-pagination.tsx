import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type PaginationLink = {
    url: string | null;
    label: string;
    active?: boolean;
};

export type PaginationData = {
    links: PaginationLink[];
    first_page_url: string | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    last_page_url: string | null;
    current_page: number;
    last_page: number;
    from?: number | null;
    to?: number | null;
    total?: number;
    per_page?: number;
};

export function PaginationSummary({ data }: { data?: PaginationData | null }) {
    const { auth } = usePage<SharedData>().props;

    if (!data || typeof data.total !== 'number') return null;

    const total = data.total;
    const listed = data.to ?? (data.per_page ? Math.min(data.current_page * data.per_page, total) : 0);
    const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR').format(value);
    const recordsPerPageLabel = <>Registros por página: {formatNumber(data.per_page ?? 20)}</>;
    const canManageOtherSettings = auth?.permissions?.includes('other_settings');

    return (
        <div className="bg-muted/20 mb-3 flex max-w-full items-center gap-2 overflow-x-auto rounded-lg border px-3 py-2 text-xs whitespace-nowrap">
            {canManageOtherSettings ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href={`${route('app.other-settings.index')}?tab=system#registros-por-pagina`}
                            className="text-muted-foreground hover:text-foreground underline decoration-dotted underline-offset-4 transition-colors"
                        >
                            {recordsPerPageLabel}
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>Alterar número de registros por página nas configurações</TooltipContent>
                </Tooltip>
            ) : (
                <span className="text-muted-foreground">{recordsPerPageLabel}</span>
            )}
            <span className="text-muted-foreground/40">·</span>
            <span className="text-muted-foreground">Listados: {formatNumber(listed)}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-muted-foreground">Total: {formatNumber(total)}</span>
        </div>
    );
}

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
            <div className="text-muted-foreground flex shrink-0 text-sm md:items-end">
                <span>
                    Página <strong>{data.current_page}</strong> de <strong>{data.last_page}</strong>
                </span>
            </div>
        </div>
    );
}
