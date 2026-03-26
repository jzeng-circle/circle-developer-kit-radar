import { useState } from 'react'
import { ExternalLink, ThumbsUp, ThumbsDown, Minus, Github, MessageCircle, BookOpen, Globe, Package, Flame } from 'lucide-react'
import type { Mention, Platform } from '../data/mockData'

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  'GitHub': Github,
  'Reddit': MessageCircle,
  'Stack Overflow': BookOpen,
  'Medium': BookOpen,
  'Dev.to': BookOpen,
  'Web Articles': Globe,
  'Hacker News': Flame,
  'npm': Package,
}

const PLATFORM_COLORS: Record<Platform, string> = {
  'GitHub': '#6ee7b7',
  'Reddit': '#fb923c',
  'Stack Overflow': '#f59e0b',
  'Medium': '#38bdf8',
  'Dev.to': '#e879f9',
  'Web Articles': '#818cf8',
  'Hacker News': '#f97316',
  'npm': '#4ade80',
}

const SENTIMENT_CONFIG = {
  positive: { icon: ThumbsUp,   color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-700/40', label: 'Positive' },
  neutral:  { icon: Minus,      color: 'text-gray-400',    bg: 'bg-gray-800/50 border-gray-700/40',       label: 'Neutral' },
  negative: { icon: ThumbsDown, color: 'text-red-400',     bg: 'bg-red-900/30 border-red-700/40',         label: 'Negative' },
}

const ALL_PLATFORMS: Platform[] = ['GitHub', 'Stack Overflow', 'Reddit', 'Medium', 'Dev.to', 'Web Articles', 'Hacker News']

interface Props {
  mentions: Mention[]
}

export default function MentionFeed({ mentions }: Props) {
  const [filter, setFilter] = useState<Platform | 'All'>('All')
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all')

  const filtered = mentions.filter(m => {
    const platformMatch = filter === 'All' || m.platform === filter
    const sentimentMatch = sentimentFilter === 'all' || m.sentiment === sentimentFilter
    return platformMatch && sentimentMatch
  })

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">
          Latest Mentions
        </h2>
        <div className="flex flex-wrap gap-2">
          {/* Platform filter */}
          <div className="flex gap-1">
            {(['All', ...ALL_PLATFORMS] as const).map(p => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Sentiment filter */}
          <div className="flex gap-1">
            {(['all', 'positive', 'neutral', 'negative'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSentimentFilter(s)}
                className={`px-2 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  sentimentFilter === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No mentions match the current filters.</p>
        )}
        {filtered.map(mention => {
          const Icon = PLATFORM_ICONS[mention.platform]
          const color = PLATFORM_COLORS[mention.platform]
          const sentiment = SENTIMENT_CONFIG[mention.sentiment]
          const SentIcon = sentiment.icon

          return (
            <div key={mention.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/60 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Icon size={14} style={{ color }} />
                  <span className="text-xs font-medium" style={{ color }}>{mention.platform}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${sentiment.bg} ${sentiment.color}`}>
                    <SentIcon size={10} />
                    {sentiment.label}
                  </span>
                  <span className="text-xs text-gray-500">{mention.date}</span>
                </div>
              </div>

              {mention.url && mention.url !== '#' ? (
                <a
                  href={mention.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-sm font-medium text-gray-100 hover:text-indigo-300 transition-colors group"
                >
                  <span className="inline-flex items-center gap-1">
                    {mention.title}
                    <ExternalLink size={11} className="text-gray-500 group-hover:text-indigo-400 flex-shrink-0" />
                  </span>
                </a>
              ) : (
                <p className="mt-2 text-sm font-medium text-gray-100">{mention.title}</p>
              )}

              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
                {mention.snippet}
              </p>

              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gray-500">by <span className="text-gray-400">{mention.author}</span></span>
                {mention.score > 0 && (
                  <span className="text-xs text-gray-500">
                    ▲ {mention.score.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
