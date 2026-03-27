'use client'

import OperatorSidebar from '@/components/sidebar/OperatorSidebar'
import Topbar from '@/components/navbar/Topbar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['operator']}>
      <div className="flex min-h-screen bg-[#0F172A]">
        <OperatorSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
