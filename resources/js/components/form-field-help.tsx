import { Info } from 'lucide-react';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface FormFieldHelp {
    label: string;
    content: string;
}

export default function FormFieldHelp({ label, content }: FormFieldHelp) {
    return (
        <div className="flex items-center gap-2">
            <Label>{label}</Label>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Info className="text-muted-foreground h-4 w-4 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>{content}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
