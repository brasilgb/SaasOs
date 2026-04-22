import { toastSuccess, toastWarning } from '@/components/app-toast-messages';
import { Button } from '@/components/ui/button';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, Star } from 'lucide-react';
import type { FormEvent } from 'react';
import { Toaster } from 'sonner';

interface TenantFeedbackPageProps {
    feedback: {
        id: number;
        feedback_token: string;
        feedback_source: string;
        feedback_status: string;
        feedback_rating?: number | null;
        feedback_comment?: string | null;
        feedback_submitted_at?: string | null;
        feedback_expires_at?: string | null;
        testimonial_consent_at?: string | null;
        testimonial_public_name?: string | null;
        testimonial_public_role?: string | null;
        tenant?: {
            name?: string | null;
            company?: string | null;
        };
    };
}

function feedbackLabel(rating: number) {
    switch (rating) {
        case 1:
            return 'Muito ruim';
        case 2:
            return 'Ruim';
        case 3:
            return 'Regular';
        case 4:
            return 'Bom';
        case 5:
            return 'Excelente';
        default:
            return 'Selecione uma nota';
    }
}

export default function TenantExperienceFeedback({ feedback }: TenantFeedbackPageProps) {
    const form = useForm({
        rating: feedback.feedback_rating ?? 0,
        comment: feedback.feedback_comment ?? '',
        allow_testimonial: Boolean(feedback.testimonial_consent_at),
        testimonial_public_name: feedback.testimonial_public_name ?? '',
        testimonial_public_role: feedback.testimonial_public_role ?? '',
    });

    const alreadySubmitted = Boolean(feedback.feedback_submitted_at);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (form.data.rating < 1) {
            toastWarning('Avaliação', 'Selecione uma nota pelo menos.');
            return;
        }

        form.post(route('tenant.feedback.submit', feedback.feedback_token), {
            preserveScroll: true,
            onSuccess: () => {
                toastSuccess('Obrigado!', 'Seu feedback foi enviado com sucesso.');
            },
            onError: () => {
                toastWarning('Erro', 'Não foi possível enviar sua avaliação neste momento.');
            },
        });
    };

    return (
        <>
            <Head title="Sua experiência com o SigmaOS" />
            <Toaster theme="dark" richColors />

            <main className="min-h-screen bg-[#07111f] px-4 py-10 text-white sm:px-6 sm:py-16">
                <div className="mx-auto max-w-3xl">
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.26)] backdrop-blur-sm sm:p-10">
                        <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1 text-[0.7rem] font-semibold tracking-[0.26em] text-[#ffd6a3] uppercase">
                            Experiência SigmaOS
                        </span>

                        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Como está sua experiência com a plataforma?</h1>

                        <p className="mt-4 text-base leading-relaxed text-white/72 sm:text-lg">
                            Sua resposta ajuda nossa equipe a entender a experiência de quem usa o SigmaOS no dia a dia e melhorar o suporte,
                            onboarding e evolução do produto.
                        </p>

                        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b1830] px-5 py-4 text-sm text-white/74">
                            <strong className="block text-white">Conta avaliada</strong>
                            <span>{feedback.tenant?.company || feedback.tenant?.name || 'Cliente SigmaOS'}</span>
                        </div>

                        {alreadySubmitted ? (
                            <div className="mt-8 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-6">
                                <div className="flex items-center gap-3 text-emerald-200">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-semibold">Feedback enviado com sucesso</span>
                                </div>

                                <p className="mt-3 text-sm leading-relaxed text-white/74">
                                    Sua avaliação já foi registrada. Obrigado por compartilhar sua experiência com o SigmaOS.
                                </p>

                                {feedback.feedback_rating ? (
                                    <p className="mt-4 text-sm text-white/82">
                                        Nota enviada: <strong>{feedback.feedback_rating}/5</strong> ({feedbackLabel(feedback.feedback_rating)})
                                    </p>
                                ) : null}

                                {feedback.feedback_comment ? <p className="mt-2 text-sm text-white/68">{feedback.feedback_comment}</p> : null}
                            </div>
                        ) : (
                            <form onSubmit={submit} className="mt-8 space-y-6">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ffd6a3]">Sua nota</p>
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {[1, 2, 3, 4, 5].map((rating) => {
                                            const selected = form.data.rating === rating;

                                            return (
                                                <button
                                                    key={rating}
                                                    type="button"
                                                    onClick={() => form.setData('rating', rating)}
                                                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                                        selected
                                                            ? 'border-[#f1b555] bg-[#f1b555]/14 text-[#ffd89a]'
                                                            : 'border-white/12 bg-white/[0.04] text-white/74 hover:bg-white/[0.08]'
                                                    }`}
                                                >
                                                    <Star className={`h-4 w-4 ${selected ? 'fill-current' : ''}`} />
                                                    {rating}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {form.data.rating > 0 ? (
                                        <p className="mt-3 text-sm text-white/60">{feedbackLabel(form.data.rating)}</p>
                                    ) : null}
                                    {form.errors.rating ? <p className="mt-2 text-sm text-red-300">{form.errors.rating}</p> : null}
                                </div>

                                <div>
                                    <label htmlFor="comment" className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ffd6a3]">
                                        Deixe sua avaliação
                                    </label>
                                    <textarea
                                        id="comment"
                                        value={form.data.comment}
                                        onChange={(event) => form.setData('comment', event.target.value)}
                                        rows={5}
                                        maxLength={2000}
                                        className="mt-4 w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f1b555]/40"
                                        placeholder="Escreva sua avaliação aqui."
                                    />
                                    {form.errors.comment ? <p className="mt-2 text-sm text-red-300">{form.errors.comment}</p> : null}
                                </div>

                                {form.data.rating >= 4 ? (
                                    <div className="rounded-2xl border border-[#f1b555]/18 bg-[#f1b555]/8 p-5">
                                        <label className="flex items-start gap-3 text-sm leading-relaxed text-white/82">
                                            <input
                                                type="checkbox"
                                                checked={form.data.allow_testimonial}
                                                onChange={(event) => form.setData('allow_testimonial', event.target.checked)}
                                                className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10"
                                            />
                                            <span>Autorizo que meu comentário seja avaliado para possível uso como depoimento na página do SigmaOS.</span>
                                        </label>

                                        {form.data.allow_testimonial ? (
                                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label htmlFor="testimonial_public_name" className="text-sm font-semibold text-[#ffe2b8]">
                                                        Nome público
                                                    </label>
                                                    <input
                                                        id="testimonial_public_name"
                                                        value={form.data.testimonial_public_name}
                                                        onChange={(event) => form.setData('testimonial_public_name', event.target.value)}
                                                        className="mt-2 w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
                                                        placeholder="Ex.: Anderson"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="testimonial_public_role" className="text-sm font-semibold text-[#ffe2b8]">
                                                        Cargo ou contexto
                                                    </label>
                                                    <input
                                                        id="testimonial_public_role"
                                                        value={form.data.testimonial_public_role}
                                                        onChange={(event) => form.setData('testimonial_public_role', event.target.value)}
                                                        className="mt-2 w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
                                                        placeholder="Ex.: Proprietário da assistência"
                                                    />
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}

                                {form.errors.feedback ? <p className="text-sm text-red-300">{form.errors.feedback}</p> : null}

                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="h-12 rounded-xl bg-[#f1b555] px-8 font-semibold text-slate-950 hover:bg-[#f5c06c]"
                                >
                                    {form.processing ? 'Enviando...' : 'Enviar avaliação'}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
