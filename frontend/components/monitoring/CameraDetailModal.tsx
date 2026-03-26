'use client'

import { Camera, Employee } from '@/types'
import { X, Maximize2, Users, Activity, ExternalLink, Shield } from 'lucide-react'
import FaceOverlay from './FaceOverlay'
import { clsx } from 'clsx'
import { useState } from 'react'

interface CameraDetailModalProps {
  camera: Camera
  onClose: () => void
  onEmployeeClick: (id: string) => void
}

export default function CameraDetailModal({ camera, onClose, onEmployeeClick }: CameraDetailModalProps) {
  const [isFaceOverlayEnabled, setIsFaceOverlayEnabled] = useState(true)

  // Mock detections for demo
  const mockDetections: any[] = [
    { id: '1', name: 'Arun Kumar', bbox: [100, 100, 150, 200], status: 'active' },
    { id: '2', name: 'John Doe', bbox: [400, 150, 120, 180], status: 'idle' },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-xl" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-6xl glass rounded-[40px] border border-[#334155]/50 overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.2)] flex flex-col md:flex-row h-full max-h-[85vh]">
        
        {/* Left: Video Feed Section */}
        <div className="flex-1 bg-[#0F172A] relative flex flex-col min-h-0">
          <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
            <div className="bg-[#0F172A]/60 backdrop-blur-md border border-[#334155] px-4 py-2 rounded-2xl flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-[#22C55E] rounded-full animate-pulse" />
              <span className="text-sm font-bold text-white uppercase tracking-tight">{camera.name}</span>
            </div>
            <button 
              onClick={() => setIsFaceOverlayEnabled(!isFaceOverlayEnabled)}
              className={clsx(
                'px-4 py-2 rounded-2xl text-xs font-bold transition-all border shadow-lg',
                isFaceOverlayEnabled 
                  ? 'bg-[#2563EB] text-white border-[#2563EB]/50' 
                  : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
              )}
            >
              {isFaceOverlayEnabled ? 'AI Vision ON' : 'AI Vision OFF'}
            </button>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-2.5 bg-[#0F172A]/60 backdrop-blur-md border border-[#334155] text-white hover:text-[#EF4444] rounded-2xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 relative overflow-hidden group">
            {/* Visual Feed Placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#334155] opacity-50">
              <Shield className="w-32 h-32 mb-4" />
              <p className="text-sm font-medium italic tracking-widest uppercase">Secured Stream | Camera {camera.id}</p>
            </div>
            
            {isFaceOverlayEnabled && (
              <FaceOverlay 
                detections={mockDetections} 
                videoWidth={1200} // Logical width
                videoHeight={800} // Logical height
              />
            )}
            
            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <button className="p-3 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all">
                  <Maximize2 className="w-5 h-5 text-white" />
                </button>
              </div>
              <span className="text-[10px] text-white/50 font-medium font-mono">ENCRYPTED | 1080p | 60 FPS</span>
            </div>
          </div>
        </div>

        {/* Right: Detected Persons Panel */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col border-l border-[#334155]/50 overflow-hidden">
          <div className="p-6 border-b border-[#334155]/50 bg-[#1E293B]/30">
            <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Detected Now</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Active Persons</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {mockDetections.map((det) => (
              <div 
                key={det.id}
                onClick={() => onEmployeeClick(det.id)}
                className="group p-3 bg-[#0F172A]/40 border border-[#334155]/50 rounded-2xl hover:border-[#2563EB]/50 hover:bg-[#2563EB]/5 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#334155] to-[#1E293B] flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                    {det.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{det.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={clsx(
                        'w-1.5 h-1.5 rounded-full',
                        det.status === 'active' ? 'bg-[#22C55E]' : det.status === 'idle' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                      )} />
                      <span className="text-[11px] text-[#94A3B8] capitalize font-medium">{det.status}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#334155] group-hover:text-[#2563EB] transition-all" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#1E293B]/20 border-t border-[#334155]/50">
            <div className="grid grid-cols-2 gap-3">
              <div className="glass p-3 rounded-2xl border border-[#334155]/30">
                <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-widest mb-1">Alerts</p>
                <p className="text-lg font-bold text-[#EF4444]">0</p>
              </div>
              <div className="glass p-3 rounded-2xl border border-[#334155]/30">
                <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-widest mb-1">Detections</p>
                <p className="text-lg font-bold text-[#22C55E]">{mockDetections.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
