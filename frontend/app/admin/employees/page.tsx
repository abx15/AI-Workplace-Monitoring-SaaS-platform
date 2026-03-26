'use client'

import { useState } from 'react'
import { Plus, Search, User, Briefcase, Hash, MoreVertical, Trash2, Edit2, CheckCircle2, XCircle, Camera, UploadCloud } from 'lucide-react'
import { clsx } from 'clsx'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const employeeSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  emp_id: z.string().min(2, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  role: z.string().min(1, 'Role is required'),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export default function AdminEmployees() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Mock employees
  const employees = [
    { id: '1', name: 'Arun Kumar', emp_id: 'EMP001', department: 'IT', role: 'Full Stack Developer', status: 'active' },
    { id: '2', name: 'Samantha Reed', emp_id: 'EMP002', department: 'Sales', role: 'Sales Manager', status: 'active' },
    { id: '3', name: 'Robert Fox', emp_id: 'EMP003', department: 'HR', role: 'HR Specialist', status: 'inactive' },
  ]

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema)
  })

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      toast.success('Employee added successfully!')
      setIsModalOpen(false)
      reset()
    } catch (error) {
      toast.error('Failed to add employee')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-[#F1F5F9] tracking-tight">Employees</h1>
          <p className="text-[#94A3B8]">Manage employee profiles and surveillance records.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold rounded-2xl flex items-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className="glass overflow-hidden rounded-[32px] border border-[#334155]/50 flex flex-col">
        <div className="p-4 border-b border-[#334155]/50 bg-[#1E293B]/30 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors" />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2 pl-10 pr-4 text-sm text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155]/50 bg-[#1E293B]/20">
                <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Employee ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/30">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#334155]/10 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-bold border border-[#2563EB]/20">
                        {emp.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-[#F1F5F9]">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8]">{emp.emp_id}</td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8]">{emp.department}</td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8]">{emp.role}</td>
                  <td className="px-6 py-4">
                    <div className={clsx(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                      emp.status === 'active' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                    )}>
                      {emp.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {emp.status}
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
          <div className="relative w-full max-w-lg glass rounded-[40px] border border-[#334155]/50 overflow-hidden shadow-2xl p-10">
            <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">Register Employee</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-[#334155] flex flex-col items-center justify-center text-[#94A3B8] hover:border-[#2563EB] hover:text-[#2563EB] transition-all cursor-pointer bg-[#0F172A]/30">
                  <UploadCloud className="w-8 h-8 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Photo</span>
                </div>
                <p className="text-[10px] text-[#94A3B8] mt-2 italic">JPEG or PNG, Max 2MB</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    {...register('name')}
                    placeholder="Arun Kumar"
                    className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50"
                  />
                  {errors.name && <p className="text-[#EF4444] text-xs">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest ml-1">Employee ID</label>
                  <input
                    {...register('emp_id')}
                    placeholder="EMP-123"
                    className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50"
                  />
                  {errors.emp_id && <p className="text-[#EF4444] text-xs">{errors.emp_id.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest ml-1">Department</label>
                  <select
                    {...register('department')}
                    className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50 appearance-none"
                  >
                    <option value="">Select Dept</option>
                    <option value="IT">IT</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest ml-1">Job Role</label>
                  <input
                    {...register('role')}
                    placeholder="Developer"
                    className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-[#1E293B] text-[#94A3B8] font-bold rounded-2xl border border-[#334155] hover:bg-[#334155] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-[#2563EB] text-white font-bold rounded-2xl shadow-lg hover:bg-[#1D4ED8] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Registering...' : <><Plus className="w-4 h-4" /> Add Employee</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
