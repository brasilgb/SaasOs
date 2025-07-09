import { AppContent } from '@/components/app-content'
import { AppShell } from '@/components/app-shell'
import { AppSidebarAdmin } from '@/components/app-sidebar-admin'
import { AppSidebarHeader } from '@/components/app-sidebar-header'
import { PropsWithChildren } from 'react'

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <AppShell variant="sidebar">
      <AppSidebarAdmin />
      <AppContent variant="sidebar">
        <AppSidebarHeader />
        {children}
      </AppContent>
    </AppShell>
  )
}