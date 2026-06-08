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
        <section className="relative overflow-hidden bg-[#0B1220] py-20 text-white sm:py-28">
            <div className="absolute inset-0">
                <div className="absolute left-[12%] top-8 h-56 w-56 rounded-full bg-[#00E59B]/10 blur-3xl" />
                <div className="absolute right-[8%] bottom-10 h-64 w-64 rounded-full bg-[#00E59B]/10 blur-3xl" />
                <div className="absolute inset-0 bg-linear-to-b from-[#0B1220] via-[#0B1220] to-[#08101d]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1 text-[0.7rem] font-semibold tracking-[0.26em] text-[#7ee7ff] uppercase">
                        Depoimentos
                    </span>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">O que clientes do VetorOS dizem sobre a rotina com a plataforma</h2>
                    <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
                        Comentários reais de clientes que usam o VetorOS na operação e autorizaram a publicação do depoimento.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:p-8">
                        <div className="absolute right-0 top-0 h-36 w-36 bg-linear-to-bl from-[#00E59B]/16 to-transparent" />
                        <div className="absolute left-0 bottom-0 h-32 w-32 bg-linear-to-tr from-[#00E59B]/12 to-transparent" />

                        <div className="relative">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#00E59B]/20 bg-[#00E59B]/10">
                                <Quote className="h-5 w-5 text-[#00B4FF]" />
                            </div>

                            <div className="mt-6 flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <Star
                                            key={index}
                                            className={`h-4 w-4 ${index < (featuredTestimonial.rating ?? 5) ? 'fill-[#00E59B] text-[#00E59B]' : 'text-white/22'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-[#9ff3d8]">{featuredTestimonial.rating ?? 5}/5</span>
                            </div>

                            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
                                "{featuredTestimonial.excerpt}"
                            </p>

                            <div className="mt-8 border-t border-white/10 pt-5">
                                <p className="text-base font-semibold text-white">{featuredTestimonial.public_name}</p>
                                <p className="mt-1 text-sm text-white/58">
                                    {[featuredTestimonial.public_role, featuredTestimonial.company].filter(Boolean).join(' • ') || 'Cliente VetorOS'}
                                </p>
                            </div>
                        </div>
                    </article>

                    <div className="grid gap-6">
                        {secondaryTestimonials.map((testimonial) => (
                            <article
                                key={testimonial.id}
                                className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-sm"
                            >
                                <div className="absolute right-0 top-0 h-24 w-24 bg-linear-to-bl from-[#00E59B]/10 to-transparent" />

                                <div className="relative">
                                    <div className="flex items-center gap-3">
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#00E59B]/20 bg-[#00E59B]/10">
                                            <Quote className="h-4 w-4 text-[#00B4FF]" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <Star
                                                    key={index}
                                                    className={`h-4 w-4 ${index < (testimonial.rating ?? 5) ? 'fill-[#00E59B] text-[#00E59B]' : 'text-white/22'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <p className="mt-5 text-sm leading-relaxed text-white/76">"{testimonial.excerpt}"</p>

                                    <div className="mt-6 border-t border-white/10 pt-4">
                                        <p className="font-semibold text-white">{testimonial.public_name}</p>
                                        <p className="mt-1 text-sm text-white/58">
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
