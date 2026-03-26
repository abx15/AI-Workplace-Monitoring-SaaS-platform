'use client'

import { useState, useEffect } from 'react'
import CameraGrid from '@/components/monitoring/CameraGrid'
import LiveAlertPanel from '@/components/monitoring/LiveAlertPanel'
import { useCameraStore } from '@/store/cameraStore'
import { useAlertStore } from '@/store/alertStore'
import { useSocket } from '@/hooks/useSocket'
import { Camera, Alert } from '@/types'
import { Search, Filter, RefreshCw, Maximize2 } from 'lucide-react'
import CameraDetailModal from '@/components/monitoring/CameraDetailModal'
import EmployeeProfileModal from '@/components/employees/EmployeeProfileModal'

export default function AdminCameras() {
  const { cameras, fetchCameras, isLoading } = useCameraStore()
  const { alerts, addAlert } = useAlertStore()
  const [localAlerts, setLocalAlerts] = useState<Alert[]>([])
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const socket = useSocket()

  useEffect(() => {
    fetchCameras()
  }, [fetchCameras])

  useEffect(() => {
    if (socket) {
      socket.on('new_alert', (alert: Alert) => {
        setLocalAlerts(prev => [alert, ...prev])
      })
    }
    return () => {
      socket?.off('new_alert')
    }
  }, [socket])

  const handleCameraClick = (camera: Camera) => {
    setSelectedCamera(camera)
    // Here we would open the detail modal (Step 16)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass p-4 rounded-3xl border border-[#334155]/50">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#F1F5F9] whitespace-nowrap">Live Monitor</h1>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded-full border border-[#22C55E]/20">
              <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
              Live Feed
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search camera..."
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50"
              />
            </div>
            <button className="p-2.5 bg-[#1E293B] text-[#94A3B8] hover:text-[#F1F5F9] rounded-xl border border-[#334155] transition-all">
              <Filter className="w-4 h-4" />
            </button>
            <button 
              onClick={() => fetchCameras()}
              className="p-2.5 bg-[#1E293B] text-[#94A3B8] hover:text-[#F1F5F9] rounded-xl border border-[#334155] transition-all"
            >
              <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <CameraGrid 
            cameras={cameras} 
            onCameraClick={handleCameraClick}
          />
        </div>
      </div>

      <div className="w-full lg:w-80 flex-shrink-0">
        <LiveAlertPanel 
          alerts={localAlerts} 
          onClear={() => setLocalAlerts([])} 
        />
      </div>

      {selectedCamera && (
        <CameraDetailModal 
          camera={selectedCamera} 
          onClose={() => setSelectedCamera(null)} 
          onEmployeeClick={(id) => setSelectedEmployeeId(id)}
        />
      )}

      {selectedEmployeeId && (
        <EmployeeProfileModal 
          employeeId={selectedEmployeeId} 
          onClose={() => setSelectedEmployeeId(null)} 
        />
      )}
    </div>
  )
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
