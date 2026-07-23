import { Quote, Star } from 'lucide-react';

export interface TestimonialItem {
    id: number;
    excerpt: string;
    public_name: string;
    public_role?: string | null;
    company?: string | null;
    rating?: number;
}

export function Testimonials({ testimonials }: { testimonials: TestimonialItem[] }) {
    if (!testimonials.length) {
        return null;
    }

    const [featuredTestimonial, ...secondaryTestimonials] = testimonials;

    return (
        <section className="border-y border-slate-200 bg-slate-50 py-24 text-slate-900 sm:py-32">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-bold text-blue-700">Depoimentos</p>
                    <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-balance text-slate-950 sm:text-5xl">
                        O que clientes do VetorOS dizem sobre a rotina com a plataforma
                    </h2>
                    <p className="mt-5 text-lg leading-8 text-slate-600">
                        Comentários reais de clientes que usam o VetorOS na operação e autorizaram a publicação do depoimento.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
                        <div className="absolute top-0 right-0 h-36 w-36 bg-linear-to-bl from-blue-100 to-transparent" />

                        <div className="relative">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                                <Quote className="h-5 w-5 text-blue-700" />
                            </div>

                            <div className="mt-6 flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <Star
                                            key={index}
                                            className={`h-4 w-4 ${index < (featuredTestimonial.rating ?? 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-slate-500">{featuredTestimonial.rating ?? 5}/5</span>
                            </div>

                            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">"{featuredTestimonial.excerpt}"</p>

                            <div className="mt-8 border-t border-slate-100 pt-5">
                                <p className="text-base font-bold text-slate-950">{featuredTestimonial.public_name}</p>
                                <p className="mt-1 text-sm text-slate-500">
                                    {[featuredTestimonial.public_role, featuredTestimonial.company].filter(Boolean).join(' • ') || 'Cliente VetorOS'}
                                </p>
                            </div>
                        </div>
                    </article>

                    <div className="grid gap-6">
                        {secondaryTestimonials.map((testimonial) => (
                            <article
                                key={testimonial.id}
                                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="relative">
                                    <div className="flex items-center gap-3">
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                            <Quote className="h-4 w-4 text-blue-700" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <Star
                                                    key={index}
                                                    className={`h-4 w-4 ${index < (testimonial.rating ?? 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <p className="mt-5 text-sm leading-6 text-slate-600">"{testimonial.excerpt}"</p>

                                    <div className="mt-6 border-t border-slate-100 pt-4">
                                        <p className="font-bold text-slate-950">{testimonial.public_name}</p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {[testimonial.public_role, testimonial.company].filter(Boolean).join(' • ') || 'Cliente VetorOS'}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
