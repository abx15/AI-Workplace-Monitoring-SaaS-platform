'use client'

import { Camera } from '@/types'
import { Video, User, MapPin, Activity, AlertCircle, CheckCircle2 } from 'lucide-react'
import { clsx } from 'clsx'

interface CameraCardProps {
  camera: Camera
  annotatedFrame?: string
  detections?: any[]
  onClick?: () => void
}

export default function CameraCard({ camera, annotatedFrame, detections, onClick }: CameraCardProps) {
  const isOnline = camera.status === 'active'

  return (
    <div 
      onClick={onClick}
      className="glass p-5 rounded-3xl border border-[#334155]/50 group hover:border-[#2563EB]/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-video mb-4 rounded-2xl overflow-hidden bg-[#0F172A] border border-[#334155]/30">
        {annotatedFrame ? (
          <img 
            src={`data:image/jpeg;base64,${annotatedFrame}`} 
            alt={camera.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Video className="w-12 h-12 text-[#94A3B8]" />
          </div>
        )}
        
        <div className="absolute top-3 left-3 z-10">
          <div className={clsx(
            'p-2 rounded-xl border backdrop-blur-md transition-colors',
            isOnline ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
          )}>
            <Video className="w-4 h-4" />
          </div>
        </div>

        <div className="absolute top-3 right-3 z-10">
          <div className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border backdrop-blur-md',
            isOnline ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
          )}>
            <span className={clsx('w-1 h-1 rounded-full animate-pulse', isOnline ? 'bg-[#22C55E]' : 'bg-[#EF4444]')} />
            {camera.status}
          </div>
        </div>
      </div>

      <h3 className="text-[#F1F5F9] font-bold text-lg tracking-tight group-hover:text-[#2563EB] transition-colors">
        {camera.name}
      </h3>
      
      <div className="space-y-2 mt-4">
        <div className="flex items-center gap-2 text-[#94A3B8] text-xs">
          <MapPin className="w-3.5 h-3.5" />
          {camera.location}
        </div>
        <div className="flex items-center gap-2 text-[#94A3B8] text-xs">
          <User className="w-3.5 h-3.5" />
          Operator: {camera.operator_id || 'Unassigned'}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[#334155]/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#22C55E]" />
          <span className="text-[11px] text-[#94A3B8]">12 detections today</span>
        </div>
        <button className="text-xs font-semibold text-[#2563EB] hover:underline underline-offset-4">
          View Feed
        </button>
      </div>
    </div>
  )
}
