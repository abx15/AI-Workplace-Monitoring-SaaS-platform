'use client'

import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { clsx } from 'clsx'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isUp: boolean
  }
  color?: 'blue' | 'green' | 'red' | 'yellow'
}

const colorMap = {
  blue: 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20',
  green: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
  red: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
  yellow: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
}

export default function StatsCard({ title, value, icon: Icon, trend, color = 'blue' }: StatsCardProps) {
  return (
    <div className="glass p-5 rounded-3xl border border-[#334155]/50 flex flex-col gap-3 group hover:border-[#2563EB]/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className={clsx('p-2.5 rounded-2xl border transition-colors', colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={clsx(
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
            trend.isUp ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'
          )}>
            {trend.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}%
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-[#94A3B8] text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-[#F1F5F9] mt-1 tracking-tight">{value}</p>
      </div>
      
      <div className="h-1 w-full bg-[#334155]/30 rounded-full overflow-hidden">
        <div 
          className={clsx('h-full rounded-full transition-all duration-1000', {
            'bg-[#2563EB]': color === 'blue',
            'bg-[#22C55E]': color === 'green',
            'bg-[#EF4444]': color === 'red',
            'bg-[#F59E0B]': color === 'yellow',
          })}
          style={{ width: '65%' }} // Placeholder progress
        />
      </div>
    </div>
  )
}
