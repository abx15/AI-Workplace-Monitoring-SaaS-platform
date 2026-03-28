'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { login, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      console.log('Attempting login with:', data.email)
      await login(data.email, data.password)
      toast.success('Login successful!')
      
      // Wait a bit for state to update
      setTimeout(() => {
        const currentState = useAuthStore.getState()
        console.log('Auth state after login:', {
          user: currentState.user,
          isAuthenticated: currentState.isAuthenticated,
          token: currentState.token
        })
        
        const currentUser = currentState.user
        if (currentUser?.role === 'admin') {
          console.log('Redirecting to admin dashboard')
          router.push('/admin/dashboard')
        } else {
          console.log('Redirecting to operator dashboard')
          router.push('/operator/dashboard')
        }
      }, 500)
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.')
    }
  }

  if (!mounted) {
    return (
      <div className="w-full max-w-md glass p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/5 via-transparent to-[#7C3AED]/5 opacity-50" />
      
      {/* Header with enhanced styling */}
      <div className="mb-8 text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-2xl mb-4 shadow-[0_8px_32px_rgba(37,99,235,0.3)]">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-white to-[#94A3B8] bg-clip-text text-transparent">Welcome Back</h2>
        <p className="text-[#94A3B8] text-sm mt-2 font-medium">Sign in to access your workspace dashboard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 relative z-10">
          <label className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest px-2 flex items-center gap-2">
            <Mail className="w-3 h-3" />
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] transition-colors group-focus-within:text-[#2563EB] z-10" />
            <input
              {...register('email')}
              type="email"
              placeholder="name@company.com"
              className="w-full bg-[#0F172A]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB] transition-all hover:border-white/10"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#2563EB]/0 to-[#2563EB]/0 group-focus-within:from-[#2563EB]/5 group-focus-within:to-[#2563EB]/0 transition-all pointer-events-none" />
          </div>
          {errors.email && <p className="text-[#EF4444] text-xs px-2 flex items-center gap-1 animate-fade-in"><span className="w-1 h-1 bg-[#EF4444] rounded-full" />{errors.email.message}</p>}
        </div>

        <div className="space-y-2 relative z-10">
          <label className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest px-2 flex items-center gap-2">
            <Lock className="w-3 h-3" />
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] transition-colors group-focus-within:text-[#2563EB] z-10" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full bg-[#0F172A]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB] transition-all hover:border-white/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors z-10 p-1 rounded-lg hover:bg-white/5"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#2563EB]/0 to-[#2563EB]/0 group-focus-within:from-[#2563EB]/5 group-focus-within:to-[#2563EB]/0 transition-all pointer-events-none" />
          </div>
          {errors.password && <p className="text-[#EF4444] text-xs px-2 flex items-center gap-1 animate-fade-in"><span className="w-1 h-1 bg-[#EF4444] rounded-full" />{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative group relative z-10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-all" />
          <div className="relative bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:scale-[1.02] text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-white/10">
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In to Dashboard
                </span>
              </>
            )}
          </div>
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#334155] text-center relative z-10">
        <div className="flex items-center justify-center gap-2 text-[#94A3B8] text-xs mb-3">
          <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
          <span>System Status: Online</span>
        </div>
        <p className="text-[#94A3B8] text-xs">
          © 2026 AI Workplace Monitor. Managed by Administration.
        </p>
        <div className="mt-3 flex items-center justify-center gap-4 text-[#64748B] text-[10px]">
          <span>Version 1.0.0</span>
          <span>•</span>
          <span>Secure Connection</span>
        </div>
      </div>
    </div>
  )
}
