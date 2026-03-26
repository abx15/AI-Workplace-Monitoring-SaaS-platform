'use client'

import { useState } from 'react'
import CameraCard from '@/components/cards/CameraCard'
import { Camera } from '@/types'
import { LayoutGrid, Grid3X3 } from 'lucide-react'
import { clsx } from 'clsx'

interface CameraGridProps {
  cameras: Camera[]
  onCameraClick: (camera: Camera) => void
}

export default function CameraGrid({ cameras, onCameraClick }: CameraGridProps) {
  const [columns, setColumns] = useState(2)

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
