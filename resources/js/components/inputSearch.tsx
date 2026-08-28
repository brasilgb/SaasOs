import { cn } from '@/lib/utils';
import { router, useForm, usePage } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface SearchProps {
    placeholder: string;
    url: string;
    date?: boolean;
    className?: string;
}

const SEARCH_DEBOUNCE_MS = 400;

export default function InputSearch({ placeholder, url, date, className }: SearchProps) {
    const { ziggy } = usePage<{ ziggy?: { query?: Record<string, string> } }>().props;
    const currentQuery = ziggy?.query ?? {};

    const { data, setData, processing } = useForm({
        search: currentQuery.search ?? '',
    });

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Evita disparar uma busca pendente depois que a tela já foi trocada.
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    function performSearch(value: string) {
        const search = value.trim();

        router.get(
            route(url),
            {
                ...currentQuery,
                page: undefined,
                search: search || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setData('search', value);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => performSearch(value), SEARCH_DEBOUNCE_MS);
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        performSearch(data.search ?? '');
    }

    function handleClearSearch() {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setData('search', '');
        performSearch('');
    }

    return (
        <form onSubmit={handleSubmit} className={cn('w-full min-w-0', className)}>
            <div className="relative w-full">
                <Input
                    className="pr-16"
                    name="search"
                    value={data.search}
                    onChange={handleChange}
                    type={date ? 'date' : 'search'}
                    placeholder={placeholder}
                    autoComplete="off"
                />
                <div className="absolute top-0 right-0 flex h-full items-center">
                    {String(data.search ?? '').length > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-full rounded-none border-l"
                            onClick={handleClearSearch}
                            title="Limpar busca"
                            aria-label="Limpar busca"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="default"
                        size="icon"
                        disabled={processing}
                        className="h-full rounded-l-none"
                        aria-label="Buscar"
                        title="Buscar agora"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </form>
    );
}
