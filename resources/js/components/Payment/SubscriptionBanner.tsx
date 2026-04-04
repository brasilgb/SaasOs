import { usePage } from '@inertiajs/react';

const GRACE_PERIOD_DAYS = 3;
const OPEN_SUBSCRIPTION_MODAL_EVENT = 'open-subscription-modal';

type SubscriptionStatus = 'grace_period' | 'active' | 'overdue' | 'canceled' | 'expired';

type SubscriptionBannerPageProps = {
    subscription_alert?: {
        status?: SubscriptionStatus;
        days_overdue?: number;
    };
};

export default function SubscriptionBanner() {
    const { subscription_alert } = usePage<SubscriptionBannerPageProps>().props;

    // Se não estiver em período de carência (grace_period), não mostra nada
    if (subscription_alert?.status !== 'grace_period') return null;

    const daysLeft = Math.max(0, Math.ceil(GRACE_PERIOD_DAYS - (subscription_alert?.days_overdue || 0)));
    const isCritical = daysLeft <= 1;

    return (
        <div className={`${isCritical ? 'bg-red-600 text-gray-50' : 'bg-amber-400 text-gray-700'} mx-4 rounded-md px-4 py-2 shadow-md`}>
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between sm:flex-row">
                <div className="flex items-center">
                    <svg className="mr-2 h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <span className="text-sm font-medium">
                        {daysLeft === 0 ? (
                            <>Sua assinatura venceu. Seu acesso pode ser bloqueado a qualquer momento.</>
                        ) : (
                            <>
                                Sua assinatura venceu. Você tem mais{' '}
                                <strong>
                                    {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
                                </strong>{' '}
                                de acesso antes do bloqueio.
                            </>
                        )}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SUBSCRIPTION_MODAL_EVENT))}
                    className="mt-2 rounded-full bg-white px-4 py-1 text-xs font-bold text-amber-600 uppercase shadow-sm transition-colors hover:bg-amber-50 sm:mt-0"
                >
                    Quero pagar agora
                </button>
            </div>
        </div>
    );
}
