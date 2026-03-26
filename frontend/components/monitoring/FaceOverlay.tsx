'use client'

import { useEffect, useRef } from 'react'
import { clsx } from 'clsx'

interface Detection {
  id: string
  name: string
  bbox: [number, number, number, number] // [x, y, w, h]
  status: 'active' | 'idle' | 'sleeping'
}

interface FaceOverlayProps {
  detections: Detection[]
  videoWidth: number
  videoHeight: number
}

export default function FaceOverlay({ detections, videoWidth, videoHeight }: FaceOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    detections.forEach((det) => {
      const [x, y, w, h] = det.bbox
      
      // Color based on status
      const color = det.status === 'active' ? '#22C55E' : det.status === 'idle' ? '#F59E0B' : '#EF4444'
      
      // Draw box
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, w, h)

      // Draw label background
      ctx.fillStyle = color
      const labelText = `${det.name} (${det.status})`
      const textWidth = ctx.measureText(labelText).width
      ctx.fillRect(x, y - 25, textWidth + 10, 25)

      // Draw label text
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 12px Inter, sans-serif'
      ctx.fillText(labelText, x + 5, y - 8)
      
      // Draw corner accents for premium feel
      ctx.beginPath()
      ctx.lineWidth = 4
      // Top Left
      ctx.moveTo(x, y + 20); ctx.lineTo(x, y); ctx.lineTo(x + 20, y)
      // Top Right
      ctx.moveTo(x + w - 20, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + 20)
      // Bottom Left
      ctx.moveTo(x, y + h - 20); ctx.lineTo(x, y + h); ctx.lineTo(x + 20, y + h)
      // Bottom Right
      ctx.moveTo(x + w - 20, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - 20)
      ctx.stroke()
    })
  }, [detections, videoWidth, videoHeight])

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="absolute inset-0 pointer-events-none z-10"
    />
  )
}
