'use client'

import { X, User, Briefcase, Hash, Activity, Clock, Bell, MapPin, ExternalLink } from 'lucide-react'
import { clsx } from 'clsx'
import ActivityChart from '../charts/ActivityChart'

interface EmployeeProfileModalProps {
  employeeId: string
  onClose: () => void
}

export default function EmployeeProfileModal({ employeeId, onClose }: EmployeeProfileModalProps) {
  // Mock employee data
  const employee = {
    id: employeeId,
    name: 'Arun Kumar Bind',
    emp_id: 'EMP-2024-001',
    department: 'Engineering',
    role: 'Full Stack Developer',
    status: 'active',
    last_seen: '2 mins ago',
    today_stats: {
      active_time: '6h 12m',
      idle_time: '45m',
      alerts: 2
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
      <div 
        className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl glass rounded-[40px] border border-[#334155]/50 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2.5 bg-[#1E293B] text-[#94A3B8] hover:text-[#EF4444] rounded-2xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pb-0 flex flex-col items-center">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-1 shadow-[0_0_30px_rgba(37,99,235,0.3)] mb-6">
            <div className="w-full h-full rounded-[20px] bg-[#0F172A] flex items-center justify-center text-4xl font-bold text-white">
              {employee.name.charAt(0)}
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold text-white tracking-tight">{employee.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="px-3 py-1 bg-[#2563EB]/10 text-[#2563EB] text-[11px] font-bold rounded-full uppercase tracking-widest border border-[#2563EB]/20">
                {employee.role}
              </span>
              <span className="px-3 py-1 bg-[#334155]/30 text-[#94A3B8] text-[11px] font-bold rounded-full uppercase tracking-widest border border-[#334155]/50">
                {employee.department}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-3xl border border-[#334155]/30 text-center">
              <Hash className="w-4 h-4 text-[#2563EB] mx-auto mb-2" />
              <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-widest">Employee ID</p>
              <p className="text-sm font-bold text-white mt-1">{employee.emp_id}</p>
            </div>
            <div className="glass p-4 rounded-3xl border border-[#334155]/30 text-center">
              <Activity className="w-4 h-4 text-[#22C55E] mx-auto mb-2" />
              <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-widest">Active Time</p>
              <p className="text-sm font-bold text-white mt-1">{employee.today_stats.active_time}</p>
            </div>
            <div className="glass p-4 rounded-3xl border border-[#334155]/30 text-center">
              <Clock className="w-4 h-4 text-[#F59E0B] mx-auto mb-2" />
              <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-widest">Idle Time</p>
              <p className="text-sm font-bold text-white mt-1">{employee.today_stats.idle_time}</p>
            </div>
            <div className="glass p-4 rounded-3xl border border-[#334155]/30 text-center">
              <Bell className="w-4 h-4 text-[#EF4444] mx-auto mb-2" />
              <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-widest">Alerts</p>
              <p className="text-sm font-bold text-white mt-1">{employee.today_stats.alerts}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2563EB]" />
              Today's Activity
            </h3>
            <div className="h-64 h-full border border-[#334155]/30 rounded-[32px] p-6 glass">
              <ActivityChart />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 glass rounded-3xl border border-[#334155]/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0F172A] border border-[#334155] flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[#94A3B8]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">Latest Location</p>
                <p className="text-xs text-[#94A3B8]">Floor 4, Section B, Zone 3</p>
              </div>
            </div>
            <button className="w-full md:w-auto px-6 py-2.5 bg-[#2563EB] text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1D4ED8] transition-all shadow-lg active:scale-95">
              Locate Now <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-[#334155]/50 bg-[#1E293B]/20 text-center">
          <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-[0.2em]">Employee Profile | Verified by AI System</p>
        </div>
      </div>
    </div>
  )
}
