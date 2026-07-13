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
        <main className="min-h-screen">
            <Head title="Início" />
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
