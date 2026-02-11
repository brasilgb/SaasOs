import { usePage } from '@inertiajs/react';

export default function SubscriptionBanner() {
    const { subscription_alert } = usePage().props as any;

    // Se não estiver em período de carência (grace_period), não mostra nada
    if (subscription_alert?.status !== 'grace_period') return null;

    const daysLeft = Math.max(0, Math.ceil(3 - (subscription_alert?.days_overdue || 0)));

    return (
        <div className={`${daysLeft <= 1 ? "bg-red-600 text-gray-50" : "bg-amber-400 text-gray-700"} px-4 py-2 shadow-md mx-4 rounded-md`}>
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm font-medium">
                        Sua assinatura venceu. Você tem mais <strong>{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</strong> de acesso antes do bloqueio.
                    </span>
                </div>
                
                <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-subscription-modal'))}
                    className="mt-2 sm:mt-0  bg-white text-amber-600 px-4 py-1 rounded-full text-xs font-bold uppercase hover:bg-amber-50 transition-colors shadow-sm"
                >
                    Quero pagar agora
                </button>
            </div>
        </div>
    );
}