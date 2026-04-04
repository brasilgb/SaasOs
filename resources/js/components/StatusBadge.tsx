import { cn } from '@/lib/utils';
import { APP_STATUS_CONFIGS } from '@/Utils/status-configs';

interface StatusBadgeProps {
    category: keyof typeof APP_STATUS_CONFIGS;
    value: string | number;
    className?: string;
}

export function StatusBadge({ category, value, className }: StatusBadgeProps) {
    const config = APP_STATUS_CONFIGS[category][value as keyof (typeof APP_STATUS_CONFIGS)[typeof category]];

    if (!config) return null;

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
                config.color,
                className,
            )}
        >
            {config.label}
        </span>
    );
}
