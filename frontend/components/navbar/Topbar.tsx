'use client'

import { Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAlertStore } from '@/store/alertStore'
import { useState } from 'react'

export default function Topbar() {
  const { user, logout } = useAuthStore()
  const { unreadCount } = useAlertStore()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <header className="h-16 glass sticky top-0 z-40 flex items-center justify-between px-6 border-b border-[#334155]/50">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-[#F1F5F9] hidden md:block">
          {user?.company_id || 'AI Workplace Monitor'}
        </h2>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden lg:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors" />
          <input
            type="text"
            placeholder="Search alerts, cameras..."
            className="w-full bg-[#0F172A]/40 border border-[#334155] rounded-full py-1.5 pl-10 pr-4 text-sm text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#334155]/30 rounded-full transition-all">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#1E293B]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pl-1 pr-3 rounded-full hover:bg-[#334155]/30 transition-all border border-transparent hover:border-[#334155]"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-medium text-[#F1F5F9] hidden sm:block">{user?.name}</span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 glass rounded-2xl shadow-2xl border border-[#334155]/50 p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="px-3 py-2 border-b border-[#334155]/50 mb-1">
                <p className="text-xs text-[#94A3B8]">Logged in as</p>
                <p className="text-sm font-medium text-[#F1F5F9]">{user?.role}</p>
              </div>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#F1F5F9] hover:bg-[#2563EB]/10 rounded-xl transition-all group">
                <User className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB]" />
                Profile
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#F1F5F9] hover:bg-[#2563EB]/10 rounded-xl transition-all group">
                <Settings className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB]" />
                Settings
              </button>
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 rounded-xl transition-all mt-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
