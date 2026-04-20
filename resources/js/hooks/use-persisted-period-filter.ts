import { useEffect, useState } from 'react';

type PersistedDateRange = {
    from?: string;
    to?: string;
};

type PersistedPeriodFilter = {
    timeRange: string;
    dateRange: PersistedDateRange;
};

const DEFAULT_FILTER: PersistedPeriodFilter = {
    timeRange: '7',
    dateRange: {},
};

function readStoredFilter(storageKey: string): PersistedPeriodFilter {
    if (typeof window === 'undefined') {
        return DEFAULT_FILTER;
    }

    try {
        const rawValue = window.localStorage.getItem(storageKey);
        if (!rawValue) {
            return DEFAULT_FILTER;
        }

        const parsed = JSON.parse(rawValue) as Partial<PersistedPeriodFilter>;

        return {
            timeRange: typeof parsed.timeRange === 'string' && parsed.timeRange !== '' ? parsed.timeRange : DEFAULT_FILTER.timeRange,
            dateRange: {
                from: typeof parsed.dateRange?.from === 'string' ? parsed.dateRange.from : undefined,
                to: typeof parsed.dateRange?.to === 'string' ? parsed.dateRange.to : undefined,
            },
        };
    } catch {
        return DEFAULT_FILTER;
    }
}

function normalizeDateValue(value?: Date | string) {
    if (!value) return undefined;

    if (value instanceof Date) {
        return value.toISOString();
    }

    return value;
}

export function usePersistedPeriodFilter(storageKey: string) {
    const [persistedFilter, setPersistedFilter] = useState<PersistedPeriodFilter>(() => readStoredFilter(storageKey));

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(storageKey, JSON.stringify(persistedFilter));
    }, [persistedFilter, storageKey]);

    const setTimeRange = (timeRange: string) => {
        setPersistedFilter((current) => ({
            ...current,
            timeRange,
        }));
    };

    const setDateRange = (dateRange: { from?: Date | string; to?: Date | string }) => {
        setPersistedFilter((current) => ({
            ...current,
            dateRange: {
                from: normalizeDateValue(dateRange?.from),
                to: normalizeDateValue(dateRange?.to),
            },
        }));
    };

    const clearDateRange = () => {
        setPersistedFilter((current) => ({
            ...current,
            dateRange: {},
        }));
    };

    return {
        timeRange: persistedFilter.timeRange,
        dateRange: persistedFilter.dateRange,
        setTimeRange,
        setDateRange,
        clearDateRange,
    };
}
