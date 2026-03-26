'use client'

import { useState, useEffect } from 'react'
import AlertCard from '@/components/cards/AlertCard'
import { useAlertStore } from '@/store/alertStore'
import { Bell, Filter, Search } from 'lucide-react'
import { clsx } from 'clsx'

export default function OperatorAlerts() {
  const { alerts, fetchAlerts, updateAlertStatus, isLoading } = useAlertStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const filteredAlerts = alerts.filter(alert => 
    alert.camera_id.toLowerCase().includes(search.toLowerCase()) || 
    alert.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#F1F5F9] tracking-tight">Assigned Alerts</h1>
        <p className="text-[#94A3B8]">Manage alerts for your assigned camera locations.</p>
      </div>

      <div className="glass p-4 rounded-3xl border border-[#334155]/50 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search my alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2 pl-10 pr-4 text-sm text-[#F1F5F9] focus:ring-2 focus:ring-[#2563EB]/50"
          />
        </div>
        <button className="p-2.5 bg-[#1E293B] text-[#94A3B8] rounded-xl border border-[#334155]">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAlerts.map((alert) => (
          <AlertCard 
            key={alert.id} 
            alert={alert} 
            onResolve={(id) => updateAlertStatus(id, 'resolved')}
            onIgnore={(id) => updateAlertStatus(id, 'ignored')}
          />
        ))}
        {filteredAlerts.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-[#94A3B8] glass rounded-[40px] border border-dashed border-[#334155]">
            <Bell className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-lg font-medium">No alerts found</p>
          </div>
        )}
      </div>
    </div>
  )
}
