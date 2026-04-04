import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

import { router, usePage } from '@inertiajs/react';

interface SelectFilterProps {
    dataStatus: Array<{
        value: string | number;
        label: string;
    }>;
    url: string;
    noOrder?: boolean;
}

export default function SelectFilter({ dataStatus, url, noOrder }: SelectFilterProps) {
    const { ziggy } = usePage<{ ziggy?: { query?: { status?: string } } }>().props;
    const status = ziggy?.query?.status ?? '';

    function handleSubmit(value: string) {
        router.get(
            route(url),
            {
                status: value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    return (
        <div className="flex items-center space-x-2">
            <Select value={status} onValueChange={handleSubmit}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>

                <SelectContent>
                    <SelectGroup>
                        {!noOrder && (
                            <>
                                <SelectLabel>Feedback</SelectLabel>
                                <SelectItem value="999">Listar Feedback</SelectItem>
                            </>
                        )}

                        <SelectLabel>Status</SelectLabel>

                        {dataStatus.map((item) => (
                            <SelectItem key={String(item.value)} value={String(item.value)}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}
