import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { NpmDownload } from '../data/mockData'

interface Props {
  data: NpmDownload[]
  packageName: string
}

export default function NpmChart({ data, packageName }: Props) {
  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-1">
        npm Downloads
      </h2>
      <p className="text-xs text-gray-500 mb-4">{packageName} — weekly</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="npmGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2130" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ background: '#1e2130', border: '1px solid #2d3148', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0', fontSize: 12 }}
            formatter={(v) => [(v as number).toLocaleString(), 'downloads']}
          />
          <Area
            type="monotone"
            dataKey="downloads"
            stroke="#4ade80"
            strokeWidth={2}
            fill="url(#npmGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
