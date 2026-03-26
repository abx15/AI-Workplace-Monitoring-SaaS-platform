'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, Calendar, Filter, Download, Activity, AlertCircle, Clock } from 'lucide-react'
import AlertTrendChart from '@/components/charts/AlertTrendChart'
import ActivityChart from '@/components/charts/ActivityChart'
import IdleTimeChart from '@/components/charts/IdleTimeChart'
import StatsCard from '@/components/cards/StatsCard'

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState('7d')

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-[#F1F5F9] tracking-tight">Advanced Analytics</h1>
          <p className="text-[#94A3B8]">Gain deep insights from AI workplace monitoring data.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-1 flex items-center">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={clsx(
                  'px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all',
                  dateRange === range ? 'bg-[#2563EB] text-white shadow-lg' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="p-3 bg-white text-black rounded-2xl hover:bg-white/90 transition-all shadow-xl flex items-center gap-2 font-bold text-xs">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Avg. Efficiency" value="84%" icon={Activity} color="green" trend={{ value: 4, isUp: true }} />
        <StatsCard title="Peak Alerts Hr" value="14:00" icon={AlertCircle} color="red" />
        <StatsCard title="Idle Time" value="12.4h" icon={Clock} color="yellow" trend={{ value: 8, isUp: false }} />
        <StatsCard title="Active Systems" value="12/12" icon={TrendingUp} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-[40px] border border-[#334155]/50 p-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Alert Intensity Trend</h3>
              <p className="text-sm text-[#94A3B8]">Total violation reports per day over selected period.</p>
            </div>
            <button className="p-2.5 bg-[#1E293B] border border-[#334155] rounded-xl text-[#94A3B8] hover:text-white transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="h-[400px]">
            <AlertTrendChart />
          </div>
        </div>

        <div className="glass rounded-[40px] border border-[#334155]/50 p-8">
          <h3 className="text-xl font-bold text-white tracking-tight mb-2">Worker State Distribution</h3>
          <p className="text-sm text-[#94A3B8] mb-10">Real-time breakdown of current workforce statuses.</p>
          <div className="h-[400px]">
            <ActivityChart />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-[40px] border border-[#334155]/50 p-8">
          <h3 className="text-xl font-bold text-white tracking-tight mb-2">Idle Time Analysis</h3>
          <p className="text-sm text-[#94A3B8] mb-10">Historical trend of workforce inactivity.</p>
          <div className="h-[300px]">
            <IdleTimeChart />
          </div>
        </div>

        <div className="lg:col-span-2 glass rounded-[40px] border border-[#334155]/50 p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight mb-2">Top Violation Hotspots</h3>
            <p className="text-sm text-[#94A3B8] mb-8">Identification of cameras/locations with most alerts.</p>
            
            <div className="space-y-4">
              {[
                { name: 'Entrance B - Floor 4', count: 42, color: '#EF4444' },
                { name: 'Server Room - North', count: 18, color: '#F59E0B' },
                { name: 'Break Room - Sec A', count: 12, color: '#334155' },
              ].map((loc, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-[#F1F5F9]">{loc.name}</span>
                    <span className="text-[#94A3B8]">{loc.count} alerts</span>
                  </div>
                  <div className="h-2 w-full bg-[#1E293B] rounded-full overflow-hidden border border-[#334155]/30">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(loc.count / 50) * 100}%`, backgroundColor: loc.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-[#334155]/30 text-center">
            <p className="text-xs text-[#94A3B8] italic font-medium">Weekly optimization report generated automatically by AI Core.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
