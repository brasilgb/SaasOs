import { CTA } from '../components/cta';
import { Features } from '../components/features';
import { Footer } from '../components/footer';
import { Header } from '../components/header';
import { Hero } from '../components/hero';
import { Pricing } from '../components/pricing';

export default function Home() {
    return (
        <main className="min-h-screen">
            <Header />
            <Hero />
            <Features />
            <Pricing />
            <CTA />
            <Footer />
        </main>
    );
}
