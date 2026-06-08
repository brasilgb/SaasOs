import { AudienceStrip } from '../components/audience-strip';
import { CTA } from '../components/cta';
import { Features } from '../components/features';
import { Footer } from '../components/footer';
import { Header } from '../components/header';
import { Hero } from '../components/hero';
import { Pricing } from '../components/pricing';
import { Testimonials, type TestimonialItem } from '../components/testimonials';

export default function Home({ testimonials = [] }: { testimonials?: TestimonialItem[] }) {
    return (
        <main className="min-h-screen">
            <Header />
            <Hero />
            <AudienceStrip />
            <Features />
            <Testimonials testimonials={testimonials} />
            <Pricing />
            <CTA />
            <Footer />
        </main>
    );
}
