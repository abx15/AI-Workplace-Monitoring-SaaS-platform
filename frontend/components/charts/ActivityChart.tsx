'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const data = [
  { name: 'Active', value: 842, color: '#22C55E' },
  { name: 'Idle', value: 120, color: '#F59E0B' },
  { name: 'Sleeping', value: 18, color: '#EF4444' },
]

export default function ActivityChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={8}
          dataKey="value"
          animationDuration={1500}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
              stroke="none"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            fontSize: '12px',
            color: '#F1F5F9'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          align="center"
          iconType="circle"
          formatter={(value) => <span className="text-xs font-medium text-[#94A3B8] px-2">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
