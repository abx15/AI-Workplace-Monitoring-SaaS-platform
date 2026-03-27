'use client'

import { Alert } from '@/types'
import { Eye, CheckCircle, XCircle, Clock, MapPin, Camera as CameraIcon } from 'lucide-react'
import { clsx } from 'clsx'
import Image from 'next/image'

interface AlertCardProps {
  alert: Alert
  onResolve?: (id: string) => void
  onIgnore?: (id: string) => void
}

const typeMap = {
  sleeping: { label: 'Sleeping', color: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' },
  idle: { label: 'Idle', color: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' },
  unknown_person: { label: 'Unknown Person', color: 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20' },
  unauthorized: { label: 'Unauthorized', color: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40' },
}

export default function AlertCard({ alert, onResolve, onIgnore }: AlertCardProps) {
  return (
    <div className="glass overflow-hidden rounded-3xl border border-[#334155]/50 group hover:border-[#2563EB]/30 transition-all duration-300">
      <div className="relative aspect-video bg-[#0F172A] overflow-hidden">
        {alert.screenshot_url ? (
          <Image 
            src={alert.screenshot_url} 
            alt="Alert screenshot" 
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#334155]">
            <CameraIcon className="w-12 h-12" />
            <span className="text-xs">No preview available</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={clsx('px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md', typeMap[alert.type]?.color)}>
            {typeMap[alert.type]?.label}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#334155]/30 flex items-center justify-center border border-[#334155]/50">
            <CameraIcon className="w-5 h-5 text-[#94A3B8]" />
          </div>
          <div>
            <h4 className="text-[#F1F5F9] font-semibold text-sm">Camera {alert.camera_id}</h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Just now
              </span>
              <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Floor 4, Sec B
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-[#334155]/30">
          <button 
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#2563EB]/10 text-[#2563EB] text-xs font-semibold hover:bg-[#2563EB] hover:text-white transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
          <button 
            onClick={() => onResolve?.(alert.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#22C55E]/10 text-[#22C55E] text-xs font-semibold hover:bg-[#22C55E] hover:text-white transition-all"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Resolve
          </button>
          <button 
            onClick={() => onIgnore?.(alert.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#EF4444]/10 text-[#EF4444] text-xs font-semibold hover:bg-[#EF4444] hover:text-white transition-all"
          >
            <XCircle className="w-3.5 h-3.5" />
            Ignore
          </button>
        </div>
      </div>
    </div>
  )
}
