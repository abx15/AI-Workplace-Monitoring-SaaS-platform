'use client'

import AdminSidebar from '@/components/sidebar/AdminSidebar'
import Topbar from '@/components/navbar/Topbar'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth('admin')

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
