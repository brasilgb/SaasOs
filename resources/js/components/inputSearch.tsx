import { router, useForm, usePage } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface SearchProps {
    placeholder: string;
    url: string;
    date?: boolean;
}

export default function InputSearch({ placeholder, url, date }: SearchProps) {
    const { ziggy } = usePage<{ ziggy?: { query?: Record<string, string> } }>().props;
    const currentQuery = ziggy?.query ?? {};

    const { data, setData, processing, reset } = useForm({
        search: currentQuery.search ?? '',
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        router.get(
            route(url),
            {
                ...currentQuery,
                page: undefined,
                search: data.search,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    function handleClearSearch() {
        reset('search');
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
        <form onSubmit={handleSubmit}>
            <div className="relative w-full">
                <Input
                    className="w-full pr-16"
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
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    <Button type="submit" variant={'default'} size={'icon'} disabled={processing} className="h-full rounded-l-none">
                        <Search className="right-1" />
                    </Button>
                </div>
            </div>
        </form>
    );
}
