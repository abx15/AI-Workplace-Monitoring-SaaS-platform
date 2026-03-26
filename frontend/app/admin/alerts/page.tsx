'use client'

import { useState, useEffect } from 'react'
import AlertCard from '@/components/cards/AlertCard'
import { useAlertStore } from '@/store/alertStore'
import { Search, Filter, CheckCircle, XCircle, ChevronLeft, ChevronRight, Bell } from 'lucide-react'
import { clsx } from 'clsx'
import { toast } from 'sonner'

export default function AdminAlerts() {
  const { alerts, fetchAlerts, updateAlertStatus, isLoading } = useAlertStore()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || alert.status === filter
    const matchesSearch = alert.camera_id.toLowerCase().includes(search.toLowerCase()) || 
                          alert.type.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleBulkResolve = async () => {
    const pendingAlerts = alerts.filter(a => a.status === 'pending')
    try {
      await Promise.all(pendingAlerts.map(a => updateAlertStatus(a.id, 'resolved')))
      toast.success('All pending alerts resolved')
    } catch (error) {
      toast.error('Failed to resolve some alerts')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-[#F1F5F9] tracking-tight">Alerts Management</h1>
          <p className="text-[#94A3B8]">Review and manage system-generated alerts.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleBulkResolve}
            className="px-4 py-2 bg-[#22C55E]/10 text-[#22C55E] text-sm font-bold rounded-xl border border-[#22C55E]/20 hover:bg-[#22C55E] hover:text-white transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Resolve All
          </button>
          <button className="px-4 py-2 bg-[#EF4444]/10 text-[#EF4444] text-sm font-bold rounded-xl border border-[#EF4444]/20 hover:bg-[#EF4444] hover:text-white transition-all flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Ignore All
          </button>
        </div>
      </div>

      <div className="glass p-4 rounded-3xl border border-[#334155]/50 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors" />
          <input
            type="text"
            placeholder="Search by Camera ID or Type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2 pl-10 pr-4 text-sm text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50"
          />
        </div>

        <div className="flex items-center gap-2 bg-[#0F172A]/50 p-1 rounded-xl border border-[#334155]">
          {['all', 'pending', 'resolved', 'ignored'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all',
                filter === f ? 'bg-[#2563EB] text-white shadow-lg' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <button className="p-2.5 bg-[#1E293B] text-[#94A3B8] hover:text-[#F1F5F9] rounded-xl border border-[#334155] transition-all">
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
        {filteredAlerts.length === 0 && !isLoading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-[#94A3B8] glass rounded-[40px] border border-dashed border-[#334155]">
            <Bell className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-lg font-medium">No alerts found</p>
            <p className="text-sm">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between glass p-4 rounded-2xl border border-[#334155]/50">
        <p className="text-xs text-[#94A3B8]">Showing {filteredAlerts.length} of {alerts.length} total alerts</p>
        <div className="flex items-center gap-2">
          <button className="p-2 text-[#94A3B8] hover:text-[#F1F5F9] disabled:opacity-30" disabled>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1">
            <span className="w-8 h-8 flex items-center justify-center bg-[#2563EB] text-white text-xs font-bold rounded-lg shadow-lg">1</span>
          </div>
          <button className="p-2 text-[#94A3B8] hover:text-[#F1F5F9] disabled:opacity-30" disabled>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
