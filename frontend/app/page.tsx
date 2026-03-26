'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/operator/dashboard')
      }
    } else {
      router.push('/auth/login')
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}