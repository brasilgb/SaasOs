import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ReactNode } from 'react';

const SLA_DESCRIPTION = 'SLA significa Acordo de Nível de Serviço. É o prazo combinado para atendimento ou resolução.';

export function SlaTooltip({ children }: { children: ReactNode }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex cursor-help items-center gap-1">{children}</span>
            </TooltipTrigger>
            <TooltipContent>{SLA_DESCRIPTION}</TooltipContent>
        </Tooltip>
    );
}
