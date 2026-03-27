'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import CameraCard from '@/components/cards/CameraCard'
import { Camera } from '@/types'
import { LayoutGrid, Grid3X3 } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/authStore'

interface CameraGridProps {
  cameras: Camera[]
  onCameraClick: (camera: Camera) => void
}

export default function CameraGrid({ cameras, onCameraClick }: CameraGridProps) {
  const [columns, setColumns] = useState(2)
  const [annotatedFrames, setAnnotatedFrames] = useState<Record<string, string>>({})
  const [detectionsMap, setDetectionsMap] = useState<Record<string, any[]>>({})
  const { user } = useAuthStore()
  const wsConnections = useRef<Record<string, WebSocket>>({})

  const startFrameCapture = (ws: WebSocket, camera_id: string) => {
    const interval = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        clearInterval(interval)
        return
      }

      // In a real app, we'd capture from a hidden video element or the active feed
      // For now, we'll provide the structure for the user to hook into
      const canvas = document.createElement('canvas')
      // ... capture logic ...
      // ws.send(JSON.stringify({
      //   frame_base64: canvas.toDataURL('image/jpeg', 0.7),
      //   camera_id: camera_id,
      //   company_id: user?.company_id
      // }))
    }, 100)
    return interval
  }

  const connectCameraWS = useCallback((camera_id: string) => {
    if (wsConnections.current[camera_id]) return

    const ws = new WebSocket(`ws://localhost:8000/ws/camera/${camera_id}`)
    wsConnections.current[camera_id] = ws

    ws.onopen = () => {
      console.log(`Camera ${camera_id} WS connected`)
      // startFrameCapture(ws, camera_id) // Disabled by default to avoid errors without source
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setAnnotatedFrames(prev => ({ ...prev, [camera_id]: data.frame }))
        setDetectionsMap(prev => ({ ...prev, [camera_id]: data.detections }))
      } catch (err) {
        console.error('WS Message parsing error:', err)
      }
    }

    ws.onerror = (err) => {
      console.error(`Camera ${camera_id} WS error:`, err)
    }

    ws.onclose = () => {
      delete wsConnections.current[camera_id]
      setTimeout(() => connectCameraWS(camera_id), 3000)
    }
  }, [user])

  useEffect(() => {
    cameras.forEach(camera => {
      if (camera.status === 'active') {
        connectCameraWS(camera.id)
      }
    })

    return () => {
      Object.values(wsConnections.current).forEach(ws => ws.close())
    }
  }, [cameras, connectCameraWS])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#F1F5F9]">Live Feeds ({cameras.length})</h3>
        <div className="flex items-center gap-1 bg-[#1E293B] p-1 rounded-xl border border-[#334155]">
          <button 
            onClick={() => setColumns(2)}
            className={clsx(
              'p-1.5 rounded-lg transition-all',
              columns === 2 ? 'bg-[#2563EB] text-white shadow-lg' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setColumns(3)}
            className={clsx(
              'p-1.5 rounded-lg transition-all',
              columns === 3 ? 'bg-[#2563EB] text-white shadow-lg' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={clsx(
        'grid gap-6 transition-all duration-500',
        columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      )}>
        {cameras.map((camera) => (
          <CameraCard 
            key={camera.id} 
            camera={camera} 
            annotatedFrame={annotatedFrames[camera.id]}
            detections={detectionsMap[camera.id]}
            onClick={() => onCameraClick(camera)}
          />
        ))}
        {cameras.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-[#94A3B8] glass rounded-3xl border border-dashed border-[#334155]">
            <p>No cameras found for this filter</p>
          </div>
        )}
      </div>
    </div>
  )
}
