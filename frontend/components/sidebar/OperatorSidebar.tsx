'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Video, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  UserCheck
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAlertStore } from '@/store/alertStore'

const menuItems = [
  { name: 'Dashboard', href: '/operator/dashboard', icon: LayoutDashboard },
  { name: 'My Cameras', href: '/operator/cameras', icon: Video },
  { name: 'Alerts', href: '/operator/alerts', icon: Bell, showBadge: true },
]

export default function OperatorSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { unreadCount } = useAlertStore()

  return (
    <aside className={clsx(
      'h-screen sticky top-0 bg-[#0F172A] border-r border-[#334155]/50 flex flex-col transition-all duration-300 z-50',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      <div className="h-16 flex items-center px-6 border-b border-[#334155]/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-[#F1F5F9] tracking-tight">OPERATOR</span>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative',
                isActive 
                  ? 'bg-[#2563EB]/15 text-[#2563EB] shadow-[inset_0_0_10px_rgba(37,99,235,0.1)]' 
                  : 'text-[#94A3B8] hover:bg-[#334155]/30 hover:text-[#F1F5F9]'
              )}
            >
              <item.icon className={clsx(
                'w-5 h-5 flex-shrink-0 transition-colors',
                isActive ? 'text-[#2563EB]' : 'group-hover:text-[#F1F5F9]'
              )} />
              
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}

              {item.showBadge && unreadCount > 0 && (
                <span className={clsx(
                  'flex items-center justify-center bg-[#EF4444] text-white font-bold rounded-full transition-all',
                  isCollapsed ? 'absolute top-1 right-1 w-2 h-2 text-[0]' : 'ml-auto px-1.5 py-0.5 text-[10px]'
                )}>
                  {!isCollapsed && unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#334155]/50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl text-[#94A3B8] hover:bg-[#334155]/30 hover:text-[#F1F5F9] transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  )
}
