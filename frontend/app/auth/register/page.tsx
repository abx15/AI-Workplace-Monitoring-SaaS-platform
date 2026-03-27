'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, ArrowRight, Building2, User, Mail, Lock, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    agreeToTerms: false
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const login = useAuthStore(state => state.login)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    setLoading(true)
    try {
      // API call to register
      // await authApi.register(formData)
      toast.success('Account created successfully!')
      router.push('/auth/login')
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="w-full max-w-4xl glass p-12 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#2563EB]/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2563EB]/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-xl w-full">
         <div className="glass p-10 md:p-16 rounded-[60px] border border-white/5 shadow-2xl space-y-10">
            <div className="text-center space-y-4">
               <Link href="/" className="inline-flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#2563EB] rounded-2xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
               </Link>
               <h1 className="text-4xl font-black text-white tracking-tighter">Create Your Account</h1>
               <p className="text-[#94A3B8] font-medium leading-relaxed">Join 500+ companies securing their workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest px-2">Company Name</label>
                     <div className="relative">
                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                        <input 
                           type="text"
                           required
                           className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/5 rounded-3xl text-white placeholder:text-[#64748B] focus:bg-white/10 focus:border-[#2563EB]/50 transition-all outline-none"
                           placeholder="Acme Inc."
                           value={formData.companyName}
                           onChange={e => setFormData({...formData, companyName: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest px-2">Your Full Name</label>
                     <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                        <input 
                           type="text"
                           required
                           className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/5 rounded-3xl text-white placeholder:text-[#64748B] focus:bg-white/10 focus:border-[#2563EB]/50 transition-all outline-none"
                           placeholder="John Doe"
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest px-2">Work Email Address</label>
                  <div className="relative">
                     <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                     <input 
                        type="email"
                        required
                        className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/5 rounded-3xl text-white placeholder:text-[#64748B] focus:bg-white/10 focus:border-[#2563EB]/50 transition-all outline-none"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                     />
                  </div>
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest px-2">Create Password</label>
                     <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                        <input 
                           type="password"
                           required
                           className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/5 rounded-3xl text-white placeholder:text-[#64748B] focus:bg-white/10 focus:border-[#2563EB]/50 transition-all outline-none"
                           placeholder="••••••••"
                           value={formData.password}
                           onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest px-2">Confirm Password</label>
                     <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                        <input 
                           type="password"
                           required
                           className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/5 rounded-3xl text-white placeholder:text-[#64748B] focus:bg-white/10 focus:border-[#2563EB]/50 transition-all outline-none"
                           placeholder="••••••••"
                           value={formData.confirmPassword}
                           onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-3 px-2">
                  <button 
                     type="button"
                     onClick={() => setFormData({...formData, agreeToTerms: !formData.agreeToTerms})}
                     className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${formData.agreeToTerms ? 'bg-[#2563EB] border-[#2563EB]' : 'bg-white/5 border-white/10'}`}
                  >
                     {formData.agreeToTerms && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <label className="text-sm text-[#94A3B8] font-medium">
                     I agree to the <Link href="/terms" className="text-white hover:underline text-balance">Terms & Privacy Policy</Link>
                  </label>
               </div>

               <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-[#2563EB] text-white font-black rounded-3xl hover:bg-[#1D4ED8] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-[0_20px_40px_rgba(37,99,235,0.3)] disabled:opacity-50"
               >
                  {loading ? 'Creating Account...' : 'Create Admin Account'} <ArrowRight className="w-5 h-5" />
               </button>
            </form>

            <div className="text-center">
               <span className="text-sm text-[#64748B] font-medium italic">Already have an account? </span>
               <Link href="/auth/login" className="text-sm text-white font-black hover:text-[#2563EB] transition-colors">Login Instead</Link>
            </div>
         </div>
      </div>
    </div>
  )
}
