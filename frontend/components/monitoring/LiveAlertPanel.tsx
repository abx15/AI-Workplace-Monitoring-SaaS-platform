'use client'

import { Alert } from '@/types'
import { Bell, Trash2, Clock, MapPin } from 'lucide-react'
import { clsx } from 'clsx'
import { useEffect, useRef } from 'react'

interface LiveAlertPanelProps {
  alerts: Alert[]
  onClear: () => void
}

export default function LiveAlertPanel({ alerts, onClear }: LiveAlertPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0 // Scroll to top for newest
    }
  }, [alerts])

  return (
    <div className="flex flex-col h-full glass rounded-3xl border border-[#334155]/50 overflow-hidden">
      <div className="p-4 border-b border-[#334155]/50 flex items-center justify-between bg-[#1E293B]/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#EF4444]" />
          <h3 className="font-bold text-[#F1F5F9] text-sm">Live Alerts</h3>
          <span className="px-1.5 py-0.5 bg-[#EF4444] text-white text-[10px] rounded-full font-bold">
            {alerts.length}
          </span>
        </div>
        <button 
          onClick={onClear}
          className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-all"
          title="Clear all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {alerts.map((alert, i) => (
          <div 
            key={alert.id} 
            className="p-3 bg-[#0F172A]/40 rounded-2xl border border-[#334155]/30 hover:border-[#2563EB]/50 transition-all group animate-in slide-in-from-right-4 duration-300"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EF4444]/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-[#EF4444]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">{alert.type.replace('_', ' ')}</p>
                <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">Camera {alert.camera_id} • Floor 4</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-[#2563EB] font-medium bg-[#2563EB]/10 px-2 py-0.5 rounded-full">New Detection</span>
                  <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                     जस्ट अब
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] py-20 text-center px-6">
            <Bell className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-xs italic">Awaiting real-time alerts from the monitor system...</p>
          </div>
        )}
      </div>

      <button className="m-4 p-3 rounded-xl bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold hover:bg-[#2563EB] hover:text-white transition-all border border-[#2563EB]/20 shadow-lg">
        View All History
      </button>
    </div>
  )
}
