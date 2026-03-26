import { useState } from 'react'
import { ExternalLink, Github, MessageCircle, BookOpen, Flame, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import type { Opportunity } from '../data/useOpportunities'
import type { OpportunityKeyword } from '../data/searchConfig'

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  'Reddit':         MessageCircle,
  'Stack Overflow': BookOpen,
  'Hacker News':    Flame,
  'GitHub':         Github,
  'Dev.to':         BookOpen,
}

const PLATFORM_COLORS: Record<string, string> = {
  'Reddit':         '#fb923c',
  'Stack Overflow': '#f59e0b',
  'Hacker News':    '#f97316',
  'GitHub':         '#6ee7b7',
  'Dev.to':         '#e879f9',
}

interface Props {
  opportunities: Opportunity[]
  keywords: OpportunityKeyword[]
  status: 'idle' | 'loading' | 'done' | 'error'
  productName: string
  onReload: () => void
}

export default function OpportunityFeed({ opportunities, keywords, status, productName, onReload }: Props) {
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null)
  const [expandedRationale, setExpandedRationale] = useState<string | null>(null)

  const filtered = activeKeyword
    ? opportunities.filter(o => o.keyword === activeKeyword)
    : opportunities

  const keywordCounts = keywords.reduce<Record<string, number>>((acc, kw) => {
    acc[kw.label] = opportunities.filter(o => o.keyword === kw.label).length
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-200">Outreach Opportunities</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Threads where developers need what {productName} solves — no product mention yet
          </p>
        </div>
        <button
          onClick={onReload}
          disabled={status === 'loading'}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 bg-gray-800 px-2 py-1.5 rounded-md disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={12} className={status === 'loading' ? 'animate-spin' : ''} />
          {status === 'loading' ? 'Searching…' : 'Refresh'}
        </button>
      </div>

      {/* Keyword filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveKeyword(null)}
          className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
            activeKeyword === null
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
          }`}
        >
          All <span className="opacity-60 ml-1">{opportunities.length}</span>
        </button>
        {keywords.map(kw => (
          <button
            key={kw.id}
            onClick={() => setActiveKeyword(activeKeyword === kw.label ? null : kw.label)}
            title={kw.rationale}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
              activeKeyword === kw.label
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
            }`}
          >
            {kw.label}
            {keywordCounts[kw.label] > 0 && (
              <span className="opacity-60 ml-1">{keywordCounts[kw.label]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      {status === 'loading' && (
        <div className="text-center py-12 text-gray-500 text-sm">
          Searching across Reddit, Stack Overflow, Hacker News, GitHub…
        </div>
      )}

      {status === 'done' && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          No opportunities found for the selected keyword in this time range.
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-12 text-red-400 text-sm">
          Failed to fetch opportunities. Check your network and try again.
        </div>
      )}

      {filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(opp => {
            const Icon = PLATFORM_ICONS[opp.platform] ?? MessageCircle
            const color = PLATFORM_COLORS[opp.platform] ?? '#94a3b8'
            const isExpanded = expandedRationale === opp.id

            return (
              <div key={opp.id} className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title + link */}
                    <div className="flex items-start gap-2">
                      <Icon size={13} style={{ color }} className="flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-200 hover:text-indigo-300 transition-colors inline-flex items-start gap-1"
                        >
                          <span>{opp.title}</span>
                          <ExternalLink size={11} className="text-gray-500 flex-shrink-0 mt-0.5" />
                        </a>
                      </div>
                    </div>

                    {/* Snippet */}
                    {opp.snippet && (
                      <p className="text-xs text-gray-500 mt-1.5 ml-5 line-clamp-2">{opp.snippet}</p>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-3 mt-2 ml-5">
                      <span className="text-xs text-gray-600">{opp.platform}</span>
                      <span className="text-xs text-gray-600">by {opp.author}</span>
                      <span className="text-xs text-gray-600">{opp.date}</span>
                      {opp.score > 0 && (
                        <span className="text-xs text-amber-500">{opp.score} pts</span>
                      )}
                      {/* Keyword tag */}
                      <span className="text-xs text-indigo-400 bg-indigo-900/20 border border-indigo-700/30 px-1.5 py-0.5 rounded-full">
                        {opp.keyword}
                      </span>
                    </div>
                  </div>

                  {/* Why this? toggle */}
                  <button
                    onClick={() => setExpandedRationale(isExpanded ? null : opp.id)}
                    className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-600 hover:text-indigo-400 transition-colors px-2 py-1 rounded-md hover:bg-gray-800"
                  >
                    Why?
                    {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                </div>

                {/* Expanded rationale */}
                {isExpanded && (
                  <div className="mt-3 ml-5 px-3 py-2 bg-indigo-900/20 border border-indigo-700/30 rounded-lg text-xs text-indigo-300">
                    <span className="font-medium text-indigo-200">{productName} fit: </span>
                    {opp.rationale}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
