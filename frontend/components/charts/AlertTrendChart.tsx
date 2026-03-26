'use client'

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'

const data = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 18 },
  { day: 'Wed', count: 8 },
  { day: 'Thu', count: 25 },
  { day: 'Fri', count: 14 },
  { day: 'Sat', count: 32 },
  { day: 'Sun', count: 20 },
]

export default function AlertTrendChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
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
          cursor={{ fill: '#2563EB', opacity: 0.1 }}
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '12px',
            color: '#F1F5F9',
            fontSize: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
          }}
          itemStyle={{ color: '#EF4444' }}
        />
        <Bar 
          dataKey="count" 
          radius={[6, 6, 0, 0]} 
          animationDuration={1500}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={index === data.length - 2 ? '#EF4444' : '#2563EB'} 
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
