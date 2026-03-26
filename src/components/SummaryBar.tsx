import { TrendingUp, TrendingDown, Globe, BookOpen, Github, MessageCircle, Package, Flame } from 'lucide-react'
import type { PlatformSummary } from '../data/mockData'
import type { SourceStatuses } from '../data/useData'

const ICONS: Record<string, React.ElementType> = {
  'GitHub': Github,
  'Reddit': MessageCircle,
  'Stack Overflow': BookOpen,
  'Web Articles': Globe,
  'Medium': BookOpen,
  'Dev.to': BookOpen,
  'Hacker News': Flame,
  'npm': Package,
}

// Map platform display name → sources key
const PLATFORM_SOURCE_KEY: Record<string, keyof SourceStatuses> = {
  'GitHub':         'github',
  'Reddit':         'reddit',
  'Stack Overflow': 'stackoverflow',
  'Dev.to':         'devto',
  'Web Articles':   'webarticles',
  'Medium':         'medium',
  'Hacker News':    'hackernews',
}

interface Props {
  totalMentions: number
  totalChange: number
  npmDownloads: number
  npmChange: number
  platformSummaries: PlatformSummary[]
  sources: SourceStatuses
}

export default function SummaryBar({ totalMentions, totalChange, npmDownloads, npmChange, platformSummaries, sources }: Props) {
  const platforms = platformSummaries.filter(p => p.platform !== 'npm')

  return (
    <div className="space-y-3 mb-2">
      {/* Row 1 — key metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/40 border border-indigo-700/50 rounded-xl px-5 py-4">
          <p className="text-xs text-indigo-300 uppercase tracking-widest mb-1">Total Mentions</p>
          <p className="text-5xl font-bold text-white leading-none">{totalMentions.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2">
            {totalChange >= 0
              ? <TrendingUp size={14} className="text-emerald-400" />
              : <TrendingDown size={14} className="text-red-400" />
            }
            <span className={`text-sm font-medium ${totalChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalChange >= 0 ? '+' : ''}{totalChange}%
            </span>
            <span className="text-xs text-gray-400 ml-1">vs prior period</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/30 border border-emerald-700/40 rounded-xl px-5 py-4">
          <p className="text-xs text-emerald-300 uppercase tracking-widest mb-1">npm Downloads</p>
          <p className="text-5xl font-bold text-white leading-none">
            {npmDownloads >= 1000 ? `${(npmDownloads / 1000).toFixed(1)}k` : npmDownloads.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {npmChange >= 0
              ? <TrendingUp size={14} className="text-emerald-400" />
              : <TrendingDown size={14} className="text-red-400" />
            }
            <span className={`text-sm font-medium ${npmChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {npmChange >= 0 ? '+' : ''}{npmChange}%
            </span>
            <span className="text-xs text-gray-400 ml-1">vs prior period</span>
          </div>
        </div>
      </div>

      {/* Row 2 — platform breakdown */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {platforms.map(p => {
          const Icon = ICONS[p.platform] || Globe
          const sourceKey = PLATFORM_SOURCE_KEY[p.platform]
          const sourceStatus = sourceKey ? sources[sourceKey] : undefined
          const hasNoResults = p.total === 0 && sourceStatus !== 'loading'

          return (
            <div key={p.platform} className="bg-gray-900/70 border border-gray-800 rounded-xl px-3 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={12} style={{ color: p.color }} />
                <p className="text-xs text-gray-400 truncate leading-none">{p.platform}</p>
              </div>
              <p className="text-2xl font-bold text-white leading-none">{p.total}</p>
              {!hasNoResults && (
                <div className="flex items-center gap-1 mt-1.5">
                  {p.change >= 0
                    ? <TrendingUp size={10} className="text-emerald-400" />
                    : <TrendingDown size={10} className="text-red-400" />
                  }
                  <span className={`text-xs ${p.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {p.change >= 0 ? '+' : ''}{p.change}%
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
