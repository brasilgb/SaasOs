import { cn } from "@/lib/utils"
import { APP_STATUS_CONFIGS } from "@/Utils/status-configs";

interface StatusBadgeProps {
  category: keyof typeof APP_STATUS_CONFIGS;
  value: string | number;
  className?: string;
}

export function StatusBadge({ category, value, className }: StatusBadgeProps) {
  // @ts-ignore - buscando a config baseada na categoria e valor
  const config = APP_STATUS_CONFIGS[category][value];

  if (!config) return null;

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap",
      config.color,
      className
    )}>
      {config.label}
    </span>
  );
}