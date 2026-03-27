'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: ('admin' | 'operator')[]
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/auth/login?redirect=${pathname}`)
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to their own dashboard if they don't have access
        router.push(user.role === 'admin' ? '/admin/dashboard' : '/operator/dashboard')
      }
    }
  }, [isAuthenticated, user, isLoading, allowedRoles, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2563EB]/10 border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return null
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null

  return <>{children}</>
}
