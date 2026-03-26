import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { DailyCount } from '../data/mockData'
import { format, parseISO } from 'date-fns'

const LINES: { key: keyof DailyCount; color: string }[] = [
  { key: 'GitHub',         color: '#6ee7b7' },
  { key: 'Reddit',         color: '#fb923c' },
  { key: 'Stack Overflow', color: '#f59e0b' },
  { key: 'Web Articles',   color: '#818cf8' },
  { key: 'Medium',         color: '#38bdf8' },
  { key: 'Dev.to',         color: '#e879f9' },
  { key: 'Hacker News',    color: '#f97316' },
]

interface Props {
  data: DailyCount[]
}

export default function TrendChart({ data }: Props) {
  // For readability, only show every Nth label depending on data length
  const tickInterval = data.length > 60 ? 13 : data.length > 30 ? 6 : 2

  const formatted = data.map(d => ({
    ...d,
    label: format(parseISO(d.date), 'MMM d'),
  }))

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4">
        Mention Trend
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={formatted} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2130" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#64748b', fontSize: 11 }}
            interval={tickInterval}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ background: '#1e2130', border: '1px solid #2d3148', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0', fontSize: 12 }}
            itemStyle={{ fontSize: 12 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 12 }}
          />
          {LINES.map(({ key, color }) => (
            <Line
              key={key as string}
              type="monotone"
              dataKey={key as string}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
