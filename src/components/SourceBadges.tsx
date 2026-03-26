import type { SourceStatuses, SourceStatus } from '../data/useData'

const LABELS: Record<keyof SourceStatuses, string> = {
  github: 'GitHub',
  reddit: 'Reddit',
  devto: 'Dev.to',
  stackoverflow: 'Stack Overflow',
  npm: 'npm',
  news: 'News',
  hackernews: 'Hacker News',
  medium: 'Medium',
  webarticles: 'Web Articles',
}

// 'none' means the API responded successfully but returned 0 results —
// the connection is live, so we display it as live.
function displayStatus(status: SourceStatus): 'loading' | 'live' | 'error' {
  if (status === 'none') return 'live'
  return status
}

const STATUS_STYLES: Record<'loading' | 'live' | 'error', string> = {
  loading: 'bg-gray-800 text-gray-500 border-gray-700',
  live:    'bg-emerald-900/30 text-emerald-400 border-emerald-700/40',
  error:   'bg-red-900/20 text-red-400 border-red-700/30',
}

const STATUS_DOT: Record<'loading' | 'live' | 'error', string> = {
  loading: 'bg-gray-500 animate-pulse',
  live:    'bg-emerald-400',
  error:   'bg-red-400',
}

const STATUS_LABEL: Record<'loading' | 'live' | 'error', string> = {
  loading: 'fetching',
  live:    'live',
  error:   'error',
}

interface Props {
  sources: SourceStatuses
  enabled: Set<keyof SourceStatuses>
  onToggle: (key: keyof SourceStatuses) => void
}

export default function SourceBadges({ sources, enabled, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <span className="text-xs text-gray-600 mr-1">Sources:</span>
      {(Object.keys(sources) as (keyof SourceStatuses)[]).map(key => {
        const status = sources[key]
        const display = displayStatus(status)
        const isEnabled = enabled.has(key)
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            title={isEnabled ? 'Click to disable' : 'Click to enable'}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
              isEnabled
                ? STATUS_STYLES[display]
                : 'bg-gray-900 text-gray-600 border-gray-800 opacity-50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isEnabled ? STATUS_DOT[display] : 'bg-gray-700'}`} />
            {LABELS[key]}
            <span className="opacity-60">· {isEnabled ? STATUS_LABEL[display] : 'off'}</span>
          </button>
        )
      })}
    </div>
  )
}
