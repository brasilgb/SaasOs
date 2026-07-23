import { AudienceStrip } from '../components/audience-strip';
import { CTA } from '../components/cta';
import { Features } from '../components/features';
import { Footer } from '../components/footer';
import { Header } from '../components/header';
import { Hero } from '../components/hero';
import { Testimonials, type TestimonialItem } from '../components/testimonials';
import { Head } from '@inertiajs/react';

export default function Home({ testimonials = [] }: { testimonials?: TestimonialItem[] }) {
    return (
        <main className="ab-public-site min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-950">
            <Head title="VetorOS — Gestão para assistências técnicas">
                <meta name="description" content="Organize ordens de serviço, clientes, estoque, financeiro e equipe com o VetorOS." />
                <meta name="theme-color" content="#ffffff" />
            </Head>
            <Header />
            <Hero />
            <AudienceStrip />
            <Features />
            <Testimonials testimonials={testimonials} />
            <CTA />
            <Footer />
        </main>
    );
}
