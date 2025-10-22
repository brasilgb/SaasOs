import { Link, usePage } from '@inertiajs/react'
import { Header } from '../components/header';
import { Hero } from '../components/hero';
import { Features } from '../components/features';
import { Pricing } from '../components/pricing';
import { CTA } from '../components/cta';
import { Footer } from '../components/footer';

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
    // <SiteLayout>
    //   <div className="container mx-auto">
    //     <h1 className="text-2xl font-bold text-gray-600">
    //       {!auth?.user &&
    //         <Link href={route('login')}>Login</Link>
    //       }
    //       {auth?.user && auth?.user?.tenant_id
    //         ? <Link href={route('app.dashboard')}>{auth?.user?.name}</Link>
    //         : <Link href={route('admin.dashboard')}>{auth?.user?.name}</Link>
    //       }
    //     </h1>
    //   </div>
    // </SiteLayout>
  )
}
