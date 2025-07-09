import AdminLayout from '@/layouts/admin/admin-layout'
import { Head } from '@inertiajs/react'
import React from 'react'

export default function Dashboard() {
  return (
    <AdminLayout>
      <Head title="Dashboard" />
      <div>Dasboard</div>
    </AdminLayout>
  )
}
