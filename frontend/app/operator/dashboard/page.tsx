'use client'

import StatsCard from '@/components/cards/StatsCard'
import AlertCard from '@/components/cards/AlertCard'
import { Video, Bell, Activity, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAlertStore } from '@/store/alertStore'
import { useCameraStore } from '@/store/cameraStore'
import { useEffect } from 'react'

export default function OperatorDashboard() {
  const { alerts, fetchAlerts } = useAlertStore()
  const { cameras, fetchCameras } = useCameraStore()

  useEffect(() => {
    fetchAlerts({ limit: 5 })
    fetchCameras()
  }, [fetchAlerts, fetchCameras])

  const stats = [
    { title: 'My Cameras', value: cameras.length, icon: Video, color: 'blue' },
    { title: 'Active Alerts', value: alerts.filter(a => a.status === 'pending').length, icon: Bell, color: 'red' },
    { title: 'System Status', value: 'Healthy', icon: Activity, color: 'green' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#F1F5F9] tracking-tight">Operator Dashboard</h1>
        <p className="text-[#94A3B8]">Monitoring assigned cameras and real-time alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...(stat as any)} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#F1F5F9]">Assigned Camera Feed</h3>
            <Link href="/operator/cameras" className="text-sm font-medium text-[#2563EB] hover:underline">View All Feeds</Link>
          </div>
          <div className="glass rounded-[32px] border border-[#334155]/50 overflow-hidden aspect-video bg-[#0F172A] relative flex items-center justify-center">
             <div className="flex flex-col items-center gap-2 opacity-30">
                <Video className="w-16 h-16 text-[#94A3B8]" />
                <p className="text-sm font-bold uppercase tracking-widest">Select Camera to view live</p>
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#F1F5F9]">Recent Alerts</h3>
            <Link href="/operator/alerts" className="text-sm font-medium text-[#2563EB] hover:underline">View All</Link>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {alerts.slice(0, 5).map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
            {alerts.length === 0 && (
              <div className="py-20 text-center text-[#94A3B8] glass rounded-3xl border border-dashed border-[#334155]">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-10" />
                <p className="text-xs italic">No alerts assigned to you</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
