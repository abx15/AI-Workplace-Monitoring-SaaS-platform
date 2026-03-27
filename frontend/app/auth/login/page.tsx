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
      await login(data.email, data.password)
      const currentUser = useAuthStore.getState().user
      toast.success('Login successful!')
      
      if (currentUser?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/operator/dashboard')
      }
    } catch (error: any) {
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
    <div className="w-full max-w-md glass p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-[#F1F5F9]">Welcome Back</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#F1F5F9] ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] transition-colors group-focus-within:text-[#2563EB]" />
            <input
              {...register('email')}
              type="email"
              placeholder="name@company.com"
              className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-3 pl-11 pr-4 text-[#F1F5F9] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB] transition-all"
            />
          </div>
          {errors.email && <p className="text-[#EF4444] text-xs ml-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#F1F5F9] ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] transition-colors group-focus-within:text-[#2563EB]" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-3 pl-11 pr-12 text-[#F1F5F9] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-[#EF4444] text-xs ml-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-3 rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Logging in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#334155] text-center">
        <p className="text-[#94A3B8] text-xs">
          © 2026 AI Workplace Monitor. Managed by Administration.
        </p>
      </div>
    </div>
  )
}
