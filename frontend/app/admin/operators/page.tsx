'use client'

import { useState } from 'react'
import { Plus, Search, Mail, User, Shield, MoreVertical, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const operatorSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type OperatorFormValues = z.infer<typeof operatorSchema>

export default function AdminOperators() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Mock operators
  const operators = [
    { id: '1', name: 'John Doe', email: 'john@company.com', cameras: 4, status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@company.com', cameras: 2, status: 'inactive' },
    { id: '3', name: 'Mike Johnson', email: 'mike@company.com', cameras: 0, status: 'active' },
  ]

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<OperatorFormValues>({
    resolver: zodResolver(operatorSchema)
  })

  const onSubmit = async (data: OperatorFormValues) => {
    try {
      // await axiosInstance.post('/operators', data)
      toast.success('Operator added successfully!')
      setIsModalOpen(false)
      reset()
    } catch (error) {
      toast.error('Failed to add operator')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-[#F1F5F9] tracking-tight">Operators</h1>
          <p className="text-[#94A3B8]">Manage security operators and their camera assignments.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold rounded-2xl flex items-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Operator
        </button>
      </div>

      <div className="glass overflow-hidden rounded-[32px] border border-[#334155]/50 flex flex-col">
        <div className="p-4 border-b border-[#334155]/50 bg-[#1E293B]/30 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors" />
            <input
              type="text"
              placeholder="Search operators..."
              className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2 pl-10 pr-4 text-sm text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155]/50 bg-[#1E293B]/20">
                <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Operator</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest text-center">Assigned Cameras</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/30">
              {operators.map((op) => (
                <tr key={op.id} className="hover:bg-[#334155]/10 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563EB]/20 to-[#60A5FA]/20 flex items-center justify-center text-[#2563EB] font-bold">
                        {op.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-[#F1F5F9]">{op.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8]">{op.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-1 bg-[#334155]/30 text-[#F1F5F9] text-xs font-bold rounded-lg border border-[#334155]">
                      {op.cameras}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={clsx(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                      op.status === 'active' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                    )}>
                      {op.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {op.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#334155]/30 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md glass rounded-3xl border border-[#334155]/50 overflow-hidden shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Add New Operator</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F1F5F9]">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#2563EB]" />
                  <input
                    {...register('name')}
                    placeholder="Operator name"
                    className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50"
                  />
                </div>
                {errors.name && <p className="text-[#EF4444] text-xs">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F1F5F9]">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#2563EB]" />
                  <input
                    {...register('email')}
                    placeholder="email@company.com"
                    className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50"
                  />
                </div>
                {errors.email && <p className="text-[#EF4444] text-xs">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F1F5F9]">Password</label>
                <div className="relative group">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#2563EB]" />
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50"
                  />
                </div>
                {errors.password && <p className="text-[#EF4444] text-xs">{errors.password.message}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-[#1E293B] text-[#94A3B8] font-bold rounded-xl border border-[#334155] hover:bg-[#334155] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-[#2563EB] text-white font-bold rounded-xl shadow-lg hover:bg-[#1D4ED8] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Operator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
