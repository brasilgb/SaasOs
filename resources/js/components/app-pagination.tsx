import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function AppPagination({ data }: any) {
    if (!data || !data.links) return null;

    // Filtra para mostrar apenas os links numéricos das páginas
    const pageLinks = data.links.filter((link: any) => !isNaN(link.label));

    // Componente interno para evitar repetição de lógica de botão
    const NavButton = ({ url, children, disabled, variant = "outline", className = "", srText = "" }: any) => {
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
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-muted-foreground flex-1 text-sm">
                Página <strong>{data.current_page}</strong> de <strong>{data.last_page}</strong>
            </div>

            <div className="flex items-center space-x-2">
                {/* Primeiro */}
                <NavButton 
                    url={data.first_page_url} 
                    disabled={data.current_page === 1}
                    className="hidden lg:flex"
                    srText="Primeira página"
                >
                    <ChevronsLeft className="size-4" />
                </NavButton>

                {/* Anterior */}
                <NavButton 
                    url={data.prev_page_url} 
                    srText="Página anterior"
                >
                    <ChevronLeft className="size-4" />
                </NavButton>

                {/* Números das Páginas */}
                {pageLinks.map((item: any, index: number) => (
                    <NavButton
                        key={index}
                        url={item.url}
                        variant={item.active ? "default" : "secondary"}
                        disabled={item.active}
                    >
                        {item.label}
                    </NavButton>
                ))}

                {/* Próximo */}
                <NavButton 
                    url={data.next_page_url} 
                    srText="Próxima página"
                >
                    <ChevronRight className="size-4" />
                </NavButton>

                {/* Último */}
                <NavButton 
                    url={data.last_page_url} 
                    disabled={data.current_page === data.last_page}
                    className="hidden lg:flex"
                    srText="Última página"
                >
                    <ChevronsRight className="size-4" />
                </NavButton>
            </div>
        </div>
    );
}