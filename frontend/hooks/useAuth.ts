import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../store/authStore'

export const useAuth = (requiredRole?: 'admin' | 'operator') => {
  const { user, isAuthenticated, isLoading, getMe } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else if (!user) {
      getMe()
    }
  }, [user, router, getMe])

  useEffect(() => {
    if (user && requiredRole && user.role !== requiredRole) {
      router.push(user.role === 'admin' ? '/admin/dashboard' : '/operator/dashboard')
    }
  }, [user, requiredRole, router])

  return { user, isAuthenticated, isLoading }
}
