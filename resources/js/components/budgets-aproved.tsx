import { Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from './ui/badge';

const BudgetsApproved = ({ count }: { count: number }) => {
    if (!count) return null;

    return (
        <Link href={route('app.orders.index', { status: 4 })} className="flex items-center">
            <Badge className="flex items-center gap-2 bg-green-100 text-green-800 transition hover:bg-green-200">
                <CheckCircle2 className="h-4 w-4" />

                {/* Texto some no mobile */}
                <span className="hidden sm:inline">Orçamentos Aprovados</span>

                {/* Contador */}
                <span className="font-semibold">{count}</span>
            </Badge>
        </Link>
    );
};
export default BudgetsApproved;
