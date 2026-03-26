import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer,
  PieChart, Pie, Legend,
} from 'recharts'
import type { PlatformSummary } from '../data/mockData'

interface Props {
  platformSummaries: PlatformSummary[]
  sentimentData: { name: string; value: number; color: string }[]
}

export default function PlatformChart({ platformSummaries, sentimentData }: Props) {
  const barData = platformSummaries
    .filter(p => p.platform !== 'npm')
    .sort((a, b) => b.total - a.total)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Platform bar chart */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4">
          Mentions by Platform
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2130" />
            <XAxis dataKey="platform" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#1e2130', border: '1px solid #2d3148', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0', fontSize: 12 }}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {barData.map((entry) => (
                <Cell key={entry.platform} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sentiment pie chart */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4">
          Sentiment Split
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={sentimentData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {sentimentData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1e2130', border: '1px solid #2d3148', borderRadius: 8 }}
              formatter={(value) => [`${value}%`, '']}
            />
            <Legend
              formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
