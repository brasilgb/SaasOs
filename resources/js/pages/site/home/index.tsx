import SiteLayout from '@/layouts/site/site-layout'
import { Link } from '@inertiajs/react'
import React from 'react'

export default function Home() {
  return (
    <SiteLayout>
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold">
            <Link href={route('admin.dashboard')}>Admin</Link>
            <Link href={route('app.dashboard')}>App</Link>
            </h1>
        </div>
    </SiteLayout>
  )
}
