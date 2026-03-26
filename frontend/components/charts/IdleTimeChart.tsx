'use client'

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

const data = [
  { day: 'Mon', time: 45 },
  { day: 'Tue', time: 52 },
  { day: 'Wed', time: 38 },
  { day: 'Thu', time: 65 },
  { day: 'Fri', time: 48 },
  { day: 'Sat', time: 24 },
  { day: 'Sun', time: 10 },
]

export default function IdleTimeChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart 
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
        <XAxis 
          dataKey="day" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94A3B8', fontSize: 12 }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94A3B8', fontSize: 12 }} 
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '12px',
            color: '#F1F5F9',
            fontSize: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="time" 
          stroke="#F59E0B" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorTime)" 
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
