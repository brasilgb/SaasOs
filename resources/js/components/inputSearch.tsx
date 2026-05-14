import { cn } from '@/lib/utils';
import { router, useForm, usePage } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface SearchProps {
    placeholder: string;
    url: string;
    date?: boolean;
    className?: string;
}

export default function InputSearch({ placeholder, url, date, className }: SearchProps) {
    const { ziggy } = usePage<{ ziggy?: { query?: Record<string, string> } }>().props;
    const currentQuery = ziggy?.query ?? {};

    const { data, setData, processing } = useForm({
        search: currentQuery.search ?? '',
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const search = String(data.search ?? '').trim();

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

    function handleClearSearch() {
        setData('search', '');
        router.get(
            route(url),
            {
                ...currentQuery,
                page: undefined,
                search: undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    return (
        <form onSubmit={handleSubmit} className={cn('w-full sm:w-[360px] lg:w-[420px]', className)}>
            <div className="relative w-full">
                <Input
                    className="pr-16"
                    name="search"
                    value={data.search}
                    onChange={(e) => setData('search', e.target.value)}
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
                    <Button type="submit" variant="default" size="icon" disabled={processing} className="h-full rounded-l-none" aria-label="Buscar">
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </form>
    );
}
